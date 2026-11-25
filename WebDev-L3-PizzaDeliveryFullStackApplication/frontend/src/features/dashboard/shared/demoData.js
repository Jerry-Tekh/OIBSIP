export const money = value => new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(value);
export const adminStats = [
 {label:"Today's revenue",value:money(428500),change:"+12.8%",note:"vs. yesterday",icon:"₦",tone:"orange"},
 {label:"Orders today",value:"48",change:"+8.2%",note:"vs. yesterday",icon:"▤",tone:"green"},
 {label:"Active orders",value:"12",change:"4 urgent",note:"in preparation or delivery",icon:"◷",tone:"purple"},
 {label:"Low-stock items",value:"3",change:"Needs attention",note:"across your inventory",icon:"⚑",tone:"red"}
];
export const recentOrders = [
 {id:"PZ-241125-084",customer:"Amara Okafor",items:"Smoky Pepperoni × 2",amount:23000,status:"in_kitchen",time:"2 min ago"},
 {id:"PZ-241125-083",customer:"Daniel James",items:"Margherita × 1, Garden × 1",amount:18500,status:"order_received",time:"8 min ago"},
 {id:"PZ-241125-082",customer:"Ifeoma Nwosu",items:"Build-your-own × 1",amount:14500,status:"sent_to_delivery",time:"14 min ago"},
 {id:"PZ-241125-081",customer:"Tunde Bello",items:"Smoky Pepperoni × 1",amount:11500,status:"delivered",time:"21 min ago"}
];
export const inventoryItems = [
 {name:"Mozzarella cheese",category:"Dairy",unit:"kg",physical:18,reserved:4,threshold:8},
 {name:"Pizza flour",category:"Dry goods",unit:"kg",physical:42,reserved:6,threshold:15},
 {name:"Pepperoni",category:"Meat",unit:"kg",physical:5,reserved:2,threshold:7},
 {name:"San Marzano tomato",category:"Produce",unit:"kg",physical:12,reserved:2,threshold:6},
 {name:"Fresh basil",category:"Produce",unit:"bunches",physical:4,reserved:1,threshold:8}
];
export const customerOrders = [
 {id:"PZ-241125-084",date:"Today, 4:32 PM",items:"Smoky Pepperoni × 2",total:23000,status:"in_kitchen"},
 {id:"PZ-241119-052",date:"19 Nov 2026",items:"Margherita × 1",total:8500,status:"delivered"},
 {id:"PZ-241110-031",date:"10 Nov 2026",items:"Garden Afterglow × 2",total:20000,status:"delivered"}
];
export const statusLabel = status => ({order_received:"Order received",in_kitchen:"In the kitchen",sent_to_delivery:"Out for delivery",delivered:"Delivered",cancelled:"Cancelled"}[status] || status);
