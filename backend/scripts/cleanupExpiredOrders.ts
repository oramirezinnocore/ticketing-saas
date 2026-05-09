import { connectDatabase, disconnectDatabase } from '../src/config/database';
import { InventoryRecoveryService } from '../src/modules/orders/inventory-recovery.service';

const cleanupExpiredOrders = async (): Promise<void> => {
  try {
    await connectDatabase();

    const inventoryRecoveryService = new InventoryRecoveryService();
    const result = await inventoryRecoveryService.cleanupExpiredOrders();

    console.log('✅ Expired orders cleanup completed');
    console.log(`   Processed: ${result.processedCount} orders`);
    console.log(`   Restored inventory:`, result.restoredInventory);

    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
};

void cleanupExpiredOrders();
