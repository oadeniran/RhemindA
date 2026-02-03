import { Purchases, PurchasesOfferings } from "@revenuecat/purchases-capacitor";
import { API_KEY } from "./config";

export const initPurchases = async (userId: string) => {
  if (typeof window === "undefined") return;

  try {
    await Purchases.configure({ apiKey: API_KEY, appUserID: userId });
  } catch (e) {
    console.warn("RevenueCat Init Skipped (Likely running on Web)", e);
  }
};

export const checkSubscription = async (): Promise<boolean> => {
  if (typeof window === "undefined") return false;

  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    
    // Check for "pro" entitlement
    return typeof customerInfo.entitlements.active["pro"] !== "undefined";
  } catch (e) {
    console.warn("Check Subscription Failed (Defaulting to Free):", e);
    return false; 
  }
};

export const purchasePro = async (): Promise<boolean> => {
  if (typeof window === "undefined") return false;

  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current && offerings.current.availablePackages.length > 0) {
      const packageToBuy = offerings.current.availablePackages[0];
      
      const { customerInfo } = await Purchases.purchasePackage({ aPackage: packageToBuy });
      
      return typeof customerInfo.entitlements.active["pro"] !== "undefined";
    }
  } catch (e: any) {
    if (!e.userCancelled) {
      alert("Purchase failed: " + e.message);
    }
  }
  return false;
};