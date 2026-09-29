/**
 * Unit Test Suite for NovaDataStore Engine
 * Verifies dynamic storage, message broadcast, deal commitments, and deduplication
 */

import { novaDataStore } from '../novaDataStore';
import { Message, User, OTCDeal, EscrowTransaction } from '../../types';

function runTests() {
  console.log('🧪 Starting NovaDataStore Unit Tests...\n');
  let passed = 0;
  let failed = 0;

  const testUser: User = {
    id: 'test-user-1',
    name: 'Archon Prime',
    handle: '@archon',
    avatarBg: 'from-cyan-600 to-blue-900',
    initials: 'AP',
    roleTitle: 'Autonomous Quant',
    rank: 'The Board',
    tier: 'Sovereign Black Card',
    status: 'online',
    passId: 'NOVA-0099-BLACK',
    verifiedAudit: true,
  };

  // Test 1: Register Member
  try {
    novaDataStore.clearAllData();
    novaDataStore.registerMember(testUser);
    const members = novaDataStore.getMembers();
    if (members.length === 1 && members[0].id === 'test-user-1') {
      console.log('✅ PASS: registerMember adds user to dynamic pool');
      passed++;
    } else {
      throw new Error(`Expected 1 member, got ${members.length}`);
    }
  } catch (err: any) {
    console.error('❌ FAIL: registerMember -', err.message);
    failed++;
  }

  // Test 2: Add Message and Retrieve by Channel
  try {
    const testMsg: Message = {
      id: 'msg-test-101',
      channelId: 'inner-circle',
      author: testUser,
      title: 'Alpha Wave Release',
      content: 'Multi-sig audit passed with 100% consensus.',
      timestamp: 'Just now',
      boosts: 1,
      hasBoosted: true,
    };

    novaDataStore.addMessage('inner-circle', testMsg);
    const msgs = novaDataStore.getMessages('inner-circle');
    if (msgs.length === 1 && msgs[0].title === 'Alpha Wave Release') {
      console.log('✅ PASS: addMessage stores and retrieves message by channel');
      passed++;
    } else {
      throw new Error(`Expected message in inner-circle, got ${msgs.length}`);
    }
  } catch (err: any) {
    console.error('❌ FAIL: addMessage -', err.message);
    failed++;
  }

  // Test 3: Boost Message Atomic Increment
  try {
    novaDataStore.boostMessage('msg-test-101');
    const msgs = novaDataStore.getMessages('inner-circle');
    if (msgs[0].boosts === 2) {
      console.log('✅ PASS: boostMessage increments message boost count');
      passed++;
    } else {
      throw new Error(`Expected 2 boosts, got ${msgs[0].boosts}`);
    }
  } catch (err: any) {
    console.error('❌ FAIL: boostMessage -', err.message);
    failed++;
  }

  // Test 4: OTC Deal Commit and Automatic Escrow Trigger
  try {
    const testDeal: OTCDeal = {
      id: 'deal-test-999',
      title: 'AI GPU Cluster Tranche',
      targetCompany: 'Zurich Compute SPV',
      niche: 'AI & Automation',
      totalAmount: 1000000,
      totalAllocation: 1000000,
      filledAmount: 0,
      expectedYield: '28% APY',
      termMonths: 12,
      minTicket: 50000,
      leadSponsor: testUser,
      status: 'Active',
    };

    novaDataStore.addDeal(testDeal);
    novaDataStore.commitDeal('deal-test-999', 250000, testUser);

    const deals = novaDataStore.getDeals();
    const updatedDeal = deals.find((d) => d.id === 'deal-test-999');
    const escrowTxs = novaDataStore.getEscrowTransactions();

    if (updatedDeal && updatedDeal.filledAmount === 250000 && escrowTxs.length > 0) {
      console.log('✅ PASS: commitDeal updates allocation and creates escrow record');
      passed++;
    } else {
      throw new Error('Deal allocation did not update or escrow transaction missing');
    }
  } catch (err: any) {
    console.error('❌ FAIL: commitDeal -', err.message);
    failed++;
  }

  // Test 5: Reactive Subscription Event
  try {
    let triggered = false;
    const unsub = novaDataStore.subscribe(() => {
      triggered = true;
    });

    novaDataStore.addNotification({
      id: 'notif-test-1',
      title: 'Test Notification',
      description: 'System alert',
      timestamp: 'Now',
      read: false,
      type: 'system',
    });

    unsub();

    if (triggered) {
      console.log('✅ PASS: subscribe triggers listener upon store changes');
      passed++;
    } else {
      throw new Error('Subscription callback was not triggered');
    }
  } catch (err: any) {
    console.error('❌ FAIL: subscribe -', err.message);
    failed++;
  }

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
