import { supabase } from './supabaseClient.js';

export async function loadAllData(userId) {
  const [profileRes, feedsRes, nightRes, napsRes, growthRes, checksRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('feeds').select('*').eq('user_id', userId).order('id', { ascending: false }),
    supabase.from('night_sleep').select('*').eq('user_id', userId).order('id', { ascending: false }),
    supabase.from('naps').select('*').eq('user_id', userId).order('id', { ascending: false }),
    supabase.from('growth_entries').select('*').eq('user_id', userId).order('id', { ascending: false }),
    supabase.from('milestone_checks').select('*').eq('user_id', userId).single(),
  ]);

  return {
    profile: profileRes.data ? {
      name: profileRes.data.name,
      birthDate: profileRes.data.birth_date,
      gender: profileRes.data.gender,
      theme: profileRes.data.theme,
      setupDone: profileRes.data.setup_done
    } : null,
    feeds: (feedsRes.data || []).map(function(f) {
      return { id: f.id, time: f.time, date: f.date, oz: f.oz, note: f.note };
    }),
    nightSleep: (nightRes.data || []).map(function(n) {
      return { id: n.id, date: n.date, start: n.start, end: n.end, durMins: n.dur_mins };
    }),
    naps: (napsRes.data || []).map(function(n) {
      return { id: n.id, date: n.date, start: n.start, end: n.end, durMins: n.dur_mins };
    }),
    growthEntries: (growthRes.data || []).map(function(g) {
      return { id: g.id, date: g.date, weight: g.weight, length: g.length, ageMonths: g.age_months };
    }),
    milestoneChecks: checksRes.data ? checksRes.data.checks : {}
  };
}

export async function saveProfile(userId, profile) {
  await supabase.from('profiles').upsert({
    id: userId,
    name: profile.name,
    birth_date: profile.birthDate,
    gender: profile.gender,
    theme: profile.theme || 'pink',
    setup_done: profile.setupDone !== false,
    updated_at: new Date().toISOString()
  });
}

export async function addFeed(userId, feed) {
  await supabase.from('feeds').insert({
    id: feed.id, user_id: userId, time: feed.time, date: feed.date,
    oz: feed.oz, note: feed.note
  });
}

export async function deleteFeed(userId, feedId) {
  await supabase.from('feeds').delete().eq('id', feedId).eq('user_id', userId);
}

export async function addNightSleep(userId, entry) {
  await supabase.from('night_sleep').insert({
    id: entry.id, user_id: userId, date: entry.date,
    start: entry.start, end: entry.end, dur_mins: entry.durMins
  });
}

export async function deleteNightSleep(userId, entryId) {
  await supabase.from('night_sleep').delete().eq('id', entryId).eq('user_id', userId);
}

export async function addNap(userId, entry) {
  await supabase.from('naps').insert({
    id: entry.id, user_id: userId, date: entry.date,
    start: entry.start, end: entry.end, dur_mins: entry.durMins
  });
}

export async function deleteNap(userId, entryId) {
  await supabase.from('naps').delete().eq('id', entryId).eq('user_id', userId);
}

export async function updateFeed(userId, feedId, fields) {
  var row = {};
  if (fields.oz != null) row.oz = fields.oz;
  if (fields.time != null) row.time = fields.time;
  if (fields.note != null) row.note = fields.note;
  await supabase.from('feeds').update(row).eq('id', feedId).eq('user_id', userId);
}

export async function updateNightSleep(userId, entryId, fields) {
  var row = {};
  if (fields.start != null) row.start = fields.start;
  if (fields.end != null) row.end = fields.end;
  if (fields.durMins != null) row.dur_mins = fields.durMins;
  await supabase.from('night_sleep').update(row).eq('id', entryId).eq('user_id', userId);
}

export async function updateNap(userId, entryId, fields) {
  var row = {};
  if (fields.start != null) row.start = fields.start;
  if (fields.end != null) row.end = fields.end;
  if (fields.durMins != null) row.dur_mins = fields.durMins;
  await supabase.from('naps').update(row).eq('id', entryId).eq('user_id', userId);
}

export async function addGrowthEntry(userId, entry) {
  await supabase.from('growth_entries').insert({
    id: entry.id, user_id: userId, date: entry.date,
    weight: entry.weight, length: entry.length, age_months: entry.ageMonths
  });
}

export async function deleteGrowthEntry(userId, entryId) {
  await supabase.from('growth_entries').delete().eq('id', entryId).eq('user_id', userId);
}

export async function saveMilestoneChecks(userId, checks) {
  await supabase.from('milestone_checks').upsert({
    user_id: userId, checks: checks, updated_at: new Date().toISOString()
  });
}

export async function migrateLocalStorage(userId) {
  const keys = {
    profile: 'bt-profile', feeds: 'bt-feeds', nightSleep: 'bt-nightsleep',
    naps: 'bt-naps', growth: 'bt-growth', checks: 'bt-checks'
  };

  function get(k) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch(e) { return null; } }

  var profile = get(keys.profile);
  if (profile && profile.name) {
    await saveProfile(userId, profile);
  }

  var feeds = get(keys.feeds);
  if (feeds && feeds.length > 0) {
    for (var i = 0; i < feeds.length; i++) { await addFeed(userId, feeds[i]); }
  }

  var nights = get(keys.nightSleep);
  if (nights && nights.length > 0) {
    for (var i = 0; i < nights.length; i++) { await addNightSleep(userId, nights[i]); }
  }

  var napData = get(keys.naps);
  if (napData && napData.length > 0) {
    for (var i = 0; i < napData.length; i++) { await addNap(userId, napData[i]); }
  }

  var growth = get(keys.growth);
  if (growth && growth.length > 0) {
    for (var i = 0; i < growth.length; i++) { await addGrowthEntry(userId, growth[i]); }
  }

  var checks = get(keys.checks);
  if (checks && Object.keys(checks).length > 0) {
    await saveMilestoneChecks(userId, checks);
  }

  // Mark migration done
  localStorage.setItem('bt-migrated', 'true');
}
