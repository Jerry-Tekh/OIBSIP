import { getAccessToken } from "../../auth/api/authApi.js";

/**
 * Phase 4 ordering is intentionally running in DEMO MODE.
 * Replace this adapter with the real API calls as the backend catalog,
 * preview, checkout and payment endpoints are implemented.
 */
export const USE_ORDERING_MOCKS = true;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const DEMO_CURRENCY = "NGN";

const mockOptions = [
  { id:"base-thin", name:"Thin & crispy", category:"base", description:"Light, crisp and delicate.", priceContributionMinor:0, currency:DEMO_CURRENCY, isAvailable:true, imageUrl:null },
  { id:"base-classic", name:"Classic hand-tossed", category:"base", description:"Soft centre with a golden edge.", priceContributionMinor:150000, currency:DEMO_CURRENCY, isAvailable:true, imageUrl:null },
  { id:"base-stuffed", name:"Cheese-stuffed crust", category:"base", description:"A little extra indulgence.", priceContributionMinor:250000, currency:DEMO_CURRENCY, isAvailable:true, imageUrl:null },
  { id:"sauce-tomato", name:"House tomato", category:"sauce", description:"Slow-cooked tomato and herbs.", priceContributionMinor:0, currency:DEMO_CURRENCY, isAvailable:true, imageUrl:null },
  { id:"sauce-bbq", name:"Smoky BBQ", category:"sauce", description:"Sweet, smoky and savoury.", priceContributionMinor:50000, currency:DEMO_CURRENCY, isAvailable:true, imageUrl:null },
  { id:"sauce-garlic", name:"Creamy garlic", category:"sauce", description:"Smooth garlic cream sauce.", priceContributionMinor:75000, currency:DEMO_CURRENCY, isAvailable:true, imageUrl:null },
  { id:"cheese-mozzarella", name:"Mozzarella", category:"cheese", description:"Stretchy, mild and creamy.", priceContributionMinor:0, currency:DEMO_CURRENCY, isAvailable:true, imageUrl:null },
  { id:"cheese-extra", name:"Extra mozzarella", category:"cheese", description:"More cheese, more joy.", priceContributionMinor:150000, currency:DEMO_CURRENCY, isAvailable:true, imageUrl:null },
  { id:"veg-mushroom", name:"Mushrooms", category:"vegetable", description:"Earthy, fresh mushrooms.", priceContributionMinor:100000, currency:DEMO_CURRENCY, isAvailable:true, imageUrl:null },
  { id:"veg-pepper", name:"Bell peppers", category:"vegetable", description:"Colourful and crunchy.", priceContributionMinor:75000, currency:DEMO_CURRENCY, isAvailable:true, imageUrl:null },
  { id:"veg-onion", name:"Red onion", category:"vegetable", description:"Sweet onion with a gentle bite.", priceContributionMinor:50000, currency:DEMO_CURRENCY, isAvailable:true, imageUrl:null },
  { id:"veg-olive", name:"Black olives", category:"vegetable", description:"Briny Mediterranean flavour.", priceContributionMinor:75000, currency:DEMO_CURRENCY, isAvailable:true, imageUrl:null },
  { id:"veg-spinach", name:"Baby spinach", category:"vegetable", description:"Fresh leafy greens.", priceContributionMinor:80000, currency:DEMO_CURRENCY, isAvailable:true, imageUrl:null }
];
const optionById = new Map(mockOptions.map(option => [option.id, option]));
const basePriceMinor = 320000;
const deliveryFeeMinor = 150000;

function mockPrice(items) {
  const pricedItems = items.map((entry,index) => {
    const ids=[entry.configuration?.baseId,entry.configuration?.sauceId,entry.configuration?.cheeseId,...(entry.configuration?.vegetableIds||[])].filter(Boolean);
    const choices=ids.map(id=>optionById.get(id)).filter(Boolean);
    const unitPriceMinor=basePriceMinor+choices.reduce((sum,option)=>sum+option.priceContributionMinor,0);
    const quantity=Math.max(1,Number(entry.quantity)||1);
    return {id:`demo-line-${index+1}`,name:"Custom pizza",unitPriceMinor,quantity,lineTotalMinor:unitPriceMinor*quantity};
  });
  const subtotalMinor=pricedItems.reduce((sum,item)=>sum+item.lineTotalMinor,0);
  return {items:pricedItems,subtotalMinor,deliveryFeeMinor,discountMinor:0,totalMinor:subtotalMinor+deliveryFeeMinor,currency:DEMO_CURRENCY};
}

async function request(path, { method = "GET", body, idempotencyKey } = {}) {
  const token = getAccessToken();
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  const response = await fetch(`${API_BASE_URL}${path}`, { method,credentials:"include",headers,body:body===undefined?undefined:JSON.stringify(body) });
  const payload=await response.json().catch(()=>({}));
  if(!response.ok||payload.success!==true){const error=new Error(payload?.error?.message||payload?.message||"We couldn't complete that request. Please try again.");error.status=response.status;error.code=payload?.error?.code;error.details=payload?.error?.details;throw error;}
  return payload.data;
}

export function getPizzaOptions() {
  return USE_ORDERING_MOCKS ? Promise.resolve({options:mockOptions.map(option=>({...option}))}) : request("/api/v1/pizza-options");
}
export function previewConfiguration(items) {
  if(USE_ORDERING_MOCKS){const totals=mockPrice(items);return Promise.resolve({...totals,totals});}
  return request("/api/v1/checkout/preview",{method:"POST",body:{items}});
}
export function createCheckout({items,deliveryAddress,idempotencyKey}) {
  if(USE_ORDERING_MOCKS){
    const totals=mockPrice(items);
    return Promise.resolve({order:{id:`demo-${Date.now()}`,orderNumber:`DEMO-${Math.floor(10000+Math.random()*90000)}`,totalMinor:totals.totalMinor,currency:totals.currency,fulfilmentStatus:"order_received",paymentStatus:"pending",deliveryAddress},payment:{id:"demo-payment-attempt",provider:"Demo payment simulator",providerOrderId:"demo-provider-order",amountMinor:totals.totalMinor,currency:totals.currency,status:"pending"},demo:true});
  }
  return request("/api/v1/checkout",{method:"POST",body:{items,deliveryAddress},idempotencyKey});
}
export function simulatePaymentSuccess(checkoutResult) {
  if (USE_ORDERING_MOCKS) {
    return Promise.resolve({
      ...checkoutResult,
      order: {
        ...checkoutResult.order,
        paymentStatus: "paid"
      },
      payment: {
        ...checkoutResult.payment,
        status: "succeeded",
        verificationStatus: "verified"
      },
      demo: true
    });
  }
  return Promise.reject(new Error("Payment verification is not yet connected."));
}
