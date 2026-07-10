import { Logger } from '@/utils/logger';
import { trackEvent } from './AnalyticsService';

/** Set true after Play Billing + Console SKUs are live. Hidden in UI while false. */
export const isIAPEnabled = false;

/** Play Console product IDs — create matching consumables in Google Play Console */
export const IAP_PRODUCTS = {
  PET_SKIN_PACK: 'pet_skin_pack_01',
  UNLOCK_FX_PACK: 'unlock_fx_pack_01',
  COIN_PACK_SMALL: 'coin_pack_100',
} as const;

export type IAPProductId = (typeof IAP_PRODUCTS)[keyof typeof IAP_PRODUCTS];

export interface IAPPurchaseResult {
  success: boolean;
  productId?: string;
  error?: string;
}

/**
 * IAP scaffold for MVP. Wire react-native-iap after Play Console products are created.
 * Dev Client rebuild required: npx expo run:android
 */
export async function initIAP(): Promise<void> {
  Logger.info('IAP', 'IAP service initialized (scaffold — connect react-native-iap for production)');
}

export async function purchaseProduct(productId: IAPProductId): Promise<IAPPurchaseResult> {
  Logger.info('IAP', `Purchase requested: ${productId}`);
  // TODO: integrate react-native-iap when Play Console SKUs are live
  return {
    success: false,
    error: 'IAP_NOT_CONFIGURED',
  };
}

export async function restorePurchases(): Promise<void> {
  Logger.info('IAP', 'Restore purchases (scaffold)');
}

export function onPurchaseSuccess(productId: IAPProductId, grantCoins?: number): void {
  trackEvent('iap_purchase', { productId, grantCoins: grantCoins ?? 0 });
}
