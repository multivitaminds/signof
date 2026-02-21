// Unified memory interface — queries across all 4 tiers

// Short-term memory is re-exported below
import { searchLongTermMemory } from './longTerm.js';
import { getProfile } from './profile.js';
import { queryEpisodes, recordEpisode as recordEp } from './episodic.js';
import { logger } from '../../lib/logger.js';

export interface UnifiedMemory {
  getRelevantContext(tenantId: string, userId: string, query: string): Promise<string>;
  recordEpisode(
    tenantId: string,
    actorId: string,
    eventType: string,
    summary: string,
    details?: Record<string, unknown>
  ): Promise<void>;
}

/**
 * Get the unified memory interface.
 */
export function getUnifiedMemory(): UnifiedMemory {
  return {
    getRelevantContext,
    recordEpisode,
  };
}

/**
 * Build a context string from all memory tiers for use in LLM prompts.
 */
async function getRelevantContext(
  tenantId: string,
  userId: string,
  searchQuery: string
): Promise<string> {
  const parts: string[] = [];

  try {
    // 1. User profile
    const profile = await getProfile(tenantId, 'user', userId);
    if (Object.keys(profile.profileData).length > 0) {
      parts.push(`User profile: ${JSON.stringify(profile.profileData)}`);
    }
    if (Object.keys(profile.preferences).length > 0) {
      parts.push(`User preferences: ${JSON.stringify(profile.preferences)}`);
    }
  } catch (err) {
    logger.debug('Profile fetch failed', { error: (err as Error).message });
  }

  try {
    // 2. Long-term memories (text search)
    const memories = await searchLongTermMemory(tenantId, searchQuery, { limit: 5 });
    if (memories.length > 0) {
      const memoryStrs = memories.map(m => `- [${m.category}] ${m.content}`);
      parts.push(`Relevant memories:\n${memoryStrs.join('\n')}`);
    }
  } catch (err) {
    logger.debug('Long-term memory search failed', { error: (err as Error).message });
  }

  try {
    // 3. Recent episodes
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const episodes = await queryEpisodes(tenantId, {
      actorId: userId,
      since,
      limit: 5,
    });
    if (episodes.length > 0) {
      const episodeStrs = episodes.map(e => `- [${e.eventType}] ${e.summary}`);
      parts.push(`Recent activity:\n${episodeStrs.join('\n')}`);
    }
  } catch (err) {
    logger.debug('Episode query failed', { error: (err as Error).message });
  }

  return parts.join('\n\n');
}

/**
 * Record an episode in memory.
 */
async function recordEpisode(
  tenantId: string,
  actorId: string,
  eventType: string,
  summary: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    await recordEp(tenantId, actorId, eventType, summary, details);
  } catch (err) {
    logger.debug('Episode recording failed', { error: (err as Error).message });
  }
}

// Re-export individual memory modules
export { setShortTerm, getShortTerm, getSessionMemory, clearSessionMemory, updateConversationBuffer, getConversationBuffer } from './shortTerm.js';
export { storeLongTermMemory, searchLongTermMemory, semanticSearch, deleteLongTermMemory } from './longTerm.js';
export { getProfile, updateProfile, listProfiles } from './profile.js';
export { recordEpisode as recordEpisodeEvent, queryEpisodes, getTimeline } from './episodic.js';
