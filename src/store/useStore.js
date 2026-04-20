import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const useStore = create((set, get) => ({
  // Global Session State
  isAuthenticated: false,
  currentUser: null, // This is the 'key' (username) for the current session
  userProfile: null, // Supabase profile data
  
  // Multi-account Data (Kept for compatibility with existing UI)
  accounts: {}, 
  
  // Transient editing state
  editingPact: null,
  
  // Helpers (Internal)
  _getCurrentAcc: () => {
    const state = get();
    return state.accounts[state.currentUser] || {
      user: { name: '', onboarded: false },
      pacts: [],
      theme: 'light',
      activePactId: null,
      password: null
    };
  },

  // Actions
  // Navigation & Auth
  
  // Initialize Auth listener
  initAuth: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await get()._loadUserData(session.user);
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await get()._loadUserData(session.user);
      } else {
        set({ 
          isAuthenticated: false, 
          currentUser: null, 
          userProfile: null,
          accounts: {} 
        });
      }
    });
  },

  _loadUserData: async (user) => {
    const username = user.user_metadata.username || user.email.split('@')[0];
    
    // Fetch Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Fetch Pacts
    const { data: pacts } = await supabase
      .from('pacts')
      .select('*')
      .eq('user_id', user.id);

    // Fetch Logs for all pacts
    const { data: logs } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id);

    // Transform pacts and logs into store format
    const transformedPacts = (pacts || []).map(p => {
      const pactLogs = {};
      (logs || []).filter(l => l.pact_id === p.id).forEach(l => {
        pactLogs[l.date] = {
          status: l.status,
          note: l.note,
          mood: l.mood,
          energy: l.energy
        };
      });

      // Calculate streak and history from logs
      const history = (logs || [])
        .filter(l => l.pact_id === p.id && l.status === 'done')
        .map(l => l.date)
        .sort();

      return {
        id: p.id,
        purposeful: p.purposeful,
        actionable: p.actionable,
        frequency: p.frequency,
        duration: p.duration,
        trackable: p.trackable,
        status: p.status,
        createdAt: p.created_at,
        streak: history.length, // Simplification for now
        lastCompleted: history[history.length - 1] || null,
        history: history,
        logs: pactLogs
      };
    });

    const accountData = {
      user: { 
        name: profile?.full_name || username, 
        onboarded: profile?.onboarded || false 
      },
      pacts: transformedPacts,
      theme: profile?.theme || 'light',
      activePactId: profile?.active_pact_id,
      password: profile?.pin_code // Mapping PIN to password for compatibility
    };

    set({
      isAuthenticated: true,
      currentUser: username,
      userProfile: profile,
      accounts: {
        [username]: accountData
      }
    });

    if (profile?.theme) {
      document.documentElement.setAttribute('data-theme', profile.theme);
    }
  },

  setCurrentUser: (username) => set({ currentUser: username }),
  
  login: async (username, pin) => {
    try {
      const email = `${username.toLowerCase().trim()}@pacttracker.local`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: pin
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Login error:', error.message);
      return false;
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false, currentUser: null, userProfile: null, accounts: {} });
  },
  
  lockApp: () => set({ isAuthenticated: false }),

  signup: async (username, name) => {
    try {
      const email = `${username.toLowerCase().trim()}@pacttracker.local`;
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: 'temp_placeholder_pin', // Will be replaced by setPassword
        options: {
          data: {
            username: username,
            full_name: name
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user returned from signup');

      // Wait for profile to be created via trigger, then load data
      // Small delay to allow DB trigger to fire
      await new Promise(resolve => setTimeout(resolve, 800));
      await get()._loadUserData(data.user);

      return true;
    } catch (error) {
      console.error('Signup error:', error.message);
      return false;
    }
  },

  setUser: async (userData) => {
    const { userProfile } = get();
    if (!userProfile) return;

    const updates = {
      full_name: userData.name || userProfile.full_name,
      onboarded: userData.onboarded !== undefined ? userData.onboarded : userProfile.onboarded
    };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userProfile.id);

    if (!error) {
      await get()._loadUserData({ id: userProfile.id, user_metadata: { username: get().currentUser }, email: '' });
    }
  },

  setPassword: async (pin) => {
    // PIN in our app is the Supabase password
    const { error } = await supabase.auth.updateUser({
      password: pin
    });

    if (error) {
      console.error('Set password error:', error.message);
      return false;
    }

    // Also update profiles table with pin_code for some logic if needed
    const { userProfile } = get();
    if (userProfile) {
      await supabase
        .from('profiles')
        .update({ pin_code: pin })
        .eq('id', userProfile.id);
    }

    set({ isAuthenticated: true });
    return true;
  },

  // Theme Management
  toggleTheme: async () => {
    const { currentUser, accounts, userProfile } = get();
    if (!currentUser || !userProfile) return;
    
    const currentTheme = accounts[currentUser].theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    const { error } = await supabase
      .from('profiles')
      .update({ theme: newTheme })
      .eq('id', userProfile.id);

    if (!error) {
      document.documentElement.setAttribute('data-theme', newTheme);
      set((state) => ({
        accounts: {
          ...state.accounts,
          [currentUser]: { ...state.accounts[currentUser], theme: newTheme }
        }
      }));
    }
  },

  setEditingPact: (pact) => set({ editingPact: pact }),

  // Pact Management
  setActivePactId: async (id) => {
    const { userProfile, currentUser } = get();
    if (!userProfile) return;

    const { error } = await supabase
      .from('profiles')
      .update({ active_pact_id: id })
      .eq('id', userProfile.id);

    if (!error) {
      set((state) => ({
        accounts: {
          ...state.accounts,
          [currentUser]: { ...state.accounts[currentUser], active_pact_id: id }
        }
      }));
    }
  },

  addPact: async (pact) => {
    const { userProfile, currentUser } = get();
    if (!userProfile) return;

    const newPact = {
      user_id: userProfile.id,
      purposeful: pact.purposeful || '',
      actionable: pact.actionable || '',
      frequency: pact.frequency || 1,
      duration: pact.duration || 30,
      trackable: pact.trackable || '',
      status: 'inprogress'
    };

    const { data, error } = await supabase
      .from('pacts')
      .insert(newPact)
      .select()
      .single();

    if (!error && data) {
      await get()._loadUserData({ id: userProfile.id, user_metadata: { username: currentUser }, email: '' });
      return data;
    }
    return null;
  },

  updatePact: async (id, updates) => {
    const { userProfile, currentUser } = get();
    if (!userProfile) return;

    const { error } = await supabase
      .from('pacts')
      .update(updates)
      .eq('id', id);

    if (!error) {
      await get()._loadUserData({ id: userProfile.id, user_metadata: { username: currentUser }, email: '' });
    }
  },

  deletePact: async (id) => {
    const { userProfile, currentUser } = get();
    if (!userProfile) return;

    const { error } = await supabase
      .from('pacts')
      .delete()
      .eq('id', id);

    if (!error) {
      await get()._loadUserData({ id: userProfile.id, user_metadata: { username: currentUser }, email: '' });
    }
  },

  completePact: async (id) => {
    const { userProfile, currentUser } = get();
    if (!userProfile) return;

    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

    const { error } = await supabase
      .from('daily_logs')
      .upsert({
        pact_id: id,
        user_id: userProfile.id,
        date: today,
        status: 'done'
      }, { onConflict: 'pact_id,date' });

    if (!error) {
      await get()._loadUserData({ id: userProfile.id, user_metadata: { username: currentUser }, email: '' });
    }
  },

  saveLog: async (id, dateStr, logData) => {
    const { userProfile, currentUser } = get();
    if (!userProfile) return;

    if (logData === null) {
      await supabase
        .from('daily_logs')
        .delete()
        .match({ pact_id: id, date: dateStr });
    } else {
      await supabase
        .from('daily_logs')
        .upsert({
          pact_id: id,
          user_id: userProfile.id,
          date: dateStr,
          status: logData.status || 'done',
          note: logData.note,
          mood: logData.mood,
          energy: logData.energy
        }, { onConflict: 'pact_id,date' });
    }

    await get()._loadUserData({ id: userProfile.id, user_metadata: { username: currentUser }, email: '' });
  },

  redoPact: async (id) => {
    const { userProfile, currentUser, accounts } = get();
    if (!userProfile || !currentUser) return;

    const pact = accounts[currentUser].pacts.find(p => p.id === id);
    if (!pact || !pact.lastCompleted) return;

    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    
    if (pact.lastCompleted === today) {
      await supabase
        .from('daily_logs')
        .delete()
        .match({ pact_id: id, date: today });
      
      await get()._loadUserData({ id: userProfile.id, user_metadata: { username: currentUser }, email: '' });
    }
  },

  refreshPacts: async () => {
    // This logic could be moved to database functions or triggers in the future
    // For now we keep it in the store and it will be called periodically
    const { userProfile, currentUser } = get();
    if (!userProfile) return;
    
    await get()._loadUserData({ id: userProfile.id, user_metadata: { username: currentUser }, email: '' });
  },

  // Data Operations remain local or could be cloud-based
  exportData: () => {
    const state = get();
    const account = state.accounts[state.currentUser];
    if (!account) return;
    const fullData = {
      pacts: account.pacts,
      user: account.user
    };
    const data = JSON.stringify(fullData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pact-tracker-${state.currentUser}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  },

  importData: async (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      const { userProfile, currentUser } = get();
      if (!userProfile) throw new Error('User not authenticated');

      const pactsToImport = data.pacts || [];
      
      for (const pact of pactsToImport) {
        // 1. Insert Pact
        const { data: insertedPact, error: pactError } = await supabase
          .from('pacts')
          .insert({
            user_id: userProfile.id,
            purposeful: pact.purposeful || '',
            actionable: pact.actionable || '',
            frequency: pact.frequency || 1,
            duration: pact.duration || 30,
            trackable: pact.trackable || '',
            status: pact.status || 'inprogress',
            created_at: pact.createdAt || new Date().toISOString()
          })
          .select()
          .single();

        if (pactError) throw pactError;

        // 2. Insert Logs if any
        if (pact.logs && Object.keys(pact.logs).length > 0) {
          const logsToInsert = Object.entries(pact.logs).map(([date, log]) => ({
            pact_id: insertedPact.id,
            user_id: userProfile.id,
            date: date,
            status: log.status || 'done',
            note: log.note || null,
            mood: log.mood || null,
            energy: log.energy || null
          }));

          const { error: logError } = await supabase
            .from('daily_logs')
            .insert(logsToInsert);

          if (logError) console.error('Error importing logs for pact:', logError.message);
        }
      }

      await get()._loadUserData({ id: userProfile.id, user_metadata: { username: currentUser }, email: '' });
      return true;
    } catch (error) {
      console.error('Import error:', error.message);
      return false;
    }
  },

  deleteAllData: async () => {
    const { userProfile, logout } = get();
    if (!userProfile) return;

    try {
      // Pacts and Logs will be deleted by Cascade if configured in DB, 
      // otherwise we delete them manually.
      // Based on our setup, we should delete logs then pacts.
      await supabase.from('daily_logs').delete().eq('user_id', userProfile.id);
      await supabase.from('pacts').delete().eq('user_id', userProfile.id);
      
      // We don't delete the profile/user account entirely here, just the data.
      await get().refreshPacts();
      return true;
    } catch (error) {
      console.error('Delete data error:', error.message);
      return false;
    }
  },

  clearState: () => set({ 
    currentUser: null,
    accounts: {},
    isAuthenticated: false,
    userProfile: null
  })
}))

export default useStore
