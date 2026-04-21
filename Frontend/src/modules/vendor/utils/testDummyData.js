/**
 * Test Helper for Vendor Dummy Data
 * 
 * Usage in Browser Console:
 * - window.initVendorData() - Clear and reinitialize all data
 * - window.checkVendorData() - Check what data exists
 * 
 * Note: Data automatically initializes when you visit /vendor/dashboard
 * if localStorage is empty.
 */

// Make it available globally for testing
if (typeof window !== 'undefined') {
  // Clear and reinitialize all vendor data
  window.initVendorData = async () => {
    // Clear existing data
    localStorage.removeItem('vendorProfile');
    localStorage.removeItem('vendorStats');
    localStorage.removeItem('vendorWorkers');
    localStorage.removeItem('vendorAcceptedBookings');
    localStorage.removeItem('vendorPendingJobs');
    localStorage.removeItem('vendorWallet');
    localStorage.removeItem('vendorTransactions');
    localStorage.removeItem('vendorEarnings');
    localStorage.removeItem('vendorEarningsHistory');
    localStorage.removeItem('vendorNotifications');
    localStorage.removeItem('vendorSettings');
    localStorage.removeItem('vendorBankAccount');
    localStorage.removeItem('vendorWithdrawals');

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 100));

    // Import and initialize
    const { initVendorDummyData } = await import('./initDummyData');
    initVendorDummyData();

    // Reload page after a delay
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // Check vendor data in localStorage
  window.checkVendorData = () => {
    return {
      profile: localStorage.getItem('vendorProfile'),
      stats: localStorage.getItem('vendorStats'),
      workers: localStorage.getItem('vendorWorkers'),
      bookings: localStorage.getItem('vendorAcceptedBookings'),
      pending: localStorage.getItem('vendorPendingJobs'),
      wallet: localStorage.getItem('vendorWallet'),
      transactions: localStorage.getItem('vendorTransactions'),
      earnings: localStorage.getItem('vendorEarnings'),
      notifications: localStorage.getItem('vendorNotifications'),
    };
  };
}

