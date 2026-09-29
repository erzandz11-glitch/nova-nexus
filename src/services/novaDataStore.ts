/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NOVA DATA STORE - Central Dynamic Container & Real-Time Sync Engine
 */

import { 
  Message, 
  EscrowTransaction, 
  OTCDeal, 
  LeaderboardEntry, 
  SyndicateNotification, 
  User, 
  Channel 
} from '../types';
import { isSupabaseConfigured } from './supabaseClient';
import { supabaseService } from './supabaseService';

const STORAGE_KEYS = {
  MESSAGES: 'nova_community_messages_v1',
  ESCROW: 'nova_community_escrow_v1',
  DEALS: 'nova_community_deals_v1',
  LEADERBOARD: 'nova_community_leaderboard_v1',
  NOTIFICATIONS: 'nova_community_notifications_v1',
  MEMBERS: 'nova_community_members_v1',
};

type StoreListener = () => void;

class NovaDataStoreEngine {
  private listeners: Set<StoreListener> = new Set();

  private messages: Record<string, Message[]> = {};
  private escrowTransactions: EscrowTransaction[] = [];
  private deals: OTCDeal[] = [];
  private leaderboard: LeaderboardEntry[] = [];
  private notifications: SyndicateNotification[] = [];
  private members: User[] = [];

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Subscribe to real-time store changes
   */
  public subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('NovaDataStore listener error:', err);
      }
    });
  }

  /**
   * Load stored dynamic data from LocalStorage
   */
  private loadFromStorage(): void {
    try {
      if (typeof window === 'undefined') return;

      const storedMsgs = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (storedMsgs) {
        this.messages = JSON.parse(storedMsgs);
      } else {
        this.messages = {};
      }

      const storedEscrow = localStorage.getItem(STORAGE_KEYS.ESCROW);
      if (storedEscrow) {
        this.escrowTransactions = JSON.parse(storedEscrow);
      } else {
        this.escrowTransactions = [];
      }

      const storedDeals = localStorage.getItem(STORAGE_KEYS.DEALS);
      if (storedDeals) {
        this.deals = JSON.parse(storedDeals);
      } else {
        this.deals = [];
      }

      const storedLeaderboard = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
      if (storedLeaderboard) {
        this.leaderboard = JSON.parse(storedLeaderboard);
      } else {
        this.leaderboard = [];
      }

      const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (storedNotifs) {
        this.notifications = JSON.parse(storedNotifs);
      } else {
        this.notifications = [];
      }

      const storedMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      if (storedMembers) {
        this.members = JSON.parse(storedMembers);
      } else {
        this.members = [];
      }
    } catch (e) {
      console.warn('NovaDataStore: Error parsing local dynamic storage, using fresh state', e);
    }
  }

  /**
   * Save dynamic data to LocalStorage
   */
  private save(key: string, data: any): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (e) {
      console.error('NovaDataStore: Failed to save to local storage', e);
    }
  }

  // =========================================================================
  // MESSAGES & DISPATCHES
  // =========================================================================

  public getMessages(channelId: string): Message[] {
    return this.messages[channelId] || [];
  }

  public getAllMessages(): Record<string, Message[]> {
    return { ...this.messages };
  }

  public addMessage(channelId: string, message: Message): void {
    const list = this.messages[channelId] || [];
    // Deduplicate by ID
    const updated = [message, ...list.filter((m) => m.id !== message.id)];
    this.messages = {
      ...this.messages,
      [channelId]: updated,
    };
    this.save(STORAGE_KEYS.MESSAGES, this.messages);
    this.notify();

    // Push to Supabase if configured
    if (isSupabaseConfigured) {
      supabaseService.sendDispatch(message);
    }
  }

  public boostMessage(messageId: string): void {
    let updated = false;
    for (const chId of Object.keys(this.messages)) {
      const idx = this.messages[chId].findIndex((m) => m.id === messageId);
      if (idx !== -1) {
        const msg = this.messages[chId][idx];
        const newBoosts = (msg.boosts || 0) + 1;
        this.messages[chId][idx] = {
          ...msg,
          boosts: newBoosts,
          hasBoosted: true,
        };
        updated = true;
      }
    }

    if (updated) {
      this.save(STORAGE_KEYS.MESSAGES, this.messages);
      this.notify();
      if (isSupabaseConfigured) {
        supabaseService.boostMessage(messageId);
      }
    }
  }

  // =========================================================================
  // ESCROW TRANSACTIONS
  // =========================================================================

  public getEscrowTransactions(): EscrowTransaction[] {
    return this.escrowTransactions;
  }

  public addEscrowTransaction(tx: EscrowTransaction): void {
    this.escrowTransactions = [tx, ...this.escrowTransactions.filter((t) => t.id !== tx.id)];
    this.save(STORAGE_KEYS.ESCROW, this.escrowTransactions);
    this.notify();
  }

  // =========================================================================
  // OTC DEALS & TRANCHES
  // =========================================================================

  public getDeals(): OTCDeal[] {
    return this.deals;
  }

  public addDeal(deal: OTCDeal): void {
    this.deals = [deal, ...this.deals.filter((d) => d.id !== deal.id)];
    this.save(STORAGE_KEYS.DEALS, this.deals);
    this.notify();
  }

  public commitDeal(dealId: string, amount: number, currentUser: User): void {
    this.deals = this.deals.map((d) => {
      if (d.id === dealId) {
        const newFilled = Math.min(d.totalAmount, d.filledAmount + amount);
        return {
          ...d,
          filledAmount: newFilled,
          status: newFilled >= d.totalAmount ? 'Filled' : 'Active',
        };
      }
      return d;
    });
    this.save(STORAGE_KEYS.DEALS, this.deals);

    // Create an associated Escrow record
    const newTx: EscrowTransaction = {
      id: `tx-${Date.now()}`,
      timestamp: 'Just now',
      amount,
      sender: currentUser.walletAddress || currentUser.name,
      recipient: 'OTC Escrow Syndicate',
      dealType: 'Secondary Tranche',
      txHash: `0x${Math.random().toString(16).substring(2, 6).toUpperCase()}...${Math.random().toString(16).substring(2, 6).toUpperCase()}`,
      nodeLocation: 'Zurich-01',
      status: 'Settled',
    };
    this.addEscrowTransaction(newTx);

    // Add notification
    this.addNotification({
      id: `notif-${Date.now()}`,
      title: 'Allocation Committed',
      description: `Committed $${amount.toLocaleString()} to Deal ${dealId}.`,
      timestamp: 'Just now',
      read: false,
      type: 'deal',
    });

    this.notify();
  }

  // =========================================================================
  // LEADERBOARD & ARENA
  // =========================================================================

  public getLeaderboard(): LeaderboardEntry[] {
    return this.leaderboard;
  }

  public updateLeaderboardEntry(entry: LeaderboardEntry): void {
    const list = this.leaderboard.filter((e) => e.user.id !== entry.user.id);
    this.leaderboard = [...list, entry].sort((a, b) => b.weeklyRevenue - a.weeklyRevenue).map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
    this.save(STORAGE_KEYS.LEADERBOARD, this.leaderboard);
    this.notify();
  }

  // =========================================================================
  // NOTIFICATIONS
  // =========================================================================

  public getNotifications(): SyndicateNotification[] {
    return this.notifications;
  }

  public addNotification(notif: SyndicateNotification): void {
    this.notifications = [notif, ...this.notifications.filter((n) => n.id !== notif.id)];
    this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  public markNotificationsAsRead(): void {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  // =========================================================================
  // MEMBERS ROSTER
  // =========================================================================

  public getMembers(): User[] {
    return this.members;
  }

  public registerMember(user: User): void {
    const existing = this.members.find((m) => m.id === user.id);
    if (!existing) {
      this.members = [...this.members, user];
      this.save(STORAGE_KEYS.MEMBERS, this.members);
      this.notify();
    }
  }

  // =========================================================================
  // UTILITY & RESET
  // =========================================================================

  public clearAllData(): void {
    this.messages = {};
    this.escrowTransactions = [];
    this.deals = [];
    this.leaderboard = [];
    this.notifications = [];
    this.members = [];

    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    }
    this.notify();
  }
}

export const novaDataStore = new NovaDataStoreEngine();
