import React from "react";
import useAuthStore from "@/app/store/useAuthStore";

const OrdersTab = ({
  activeTab,
  orderStatus,
  setOrderStatus,
  orderData,
  renderCard,
}) => {
  const { currentProfile } = useAuthStore();
  const profileType = currentProfile?.profileType;
  console.log(orderData, "orderData");
  return (
    <div>
      <>
        {activeTab === "orders" && profileType === "buyer" && (
          <>
            {/* Filter buttons */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 items-center mt-8 mb-6">
              <button
                className={`text-black px-4 py-2 border-b-2 ${
                  orderStatus === "recent"
                    ? "border-primary font-medium"
                    : "border-transparent hover:border-primary transition-all"
                }`}
                onClick={() => setOrderStatus("recent")}
              >
                Recent
              </button>
              <button
                className={`text-black px-4 py-2 border-b-2 ${
                  orderStatus === "in-progress"
                    ? "border-primary font-medium"
                    : "border-transparent hover:border-primary transition-all"
                }`}
                onClick={() => setOrderStatus("in-progress")}
              >
                In Progress
              </button>
              <button
                className={`text-black px-4 py-2 border-b-2 ${
                  orderStatus === "complete"
                    ? "border-primary font-medium"
                    : "border-transparent hover:border-primary transition-all"
                }`}
                onClick={() => setOrderStatus("complete")}
              >
                Completed
              </button>
            </div>

            {/* Order data rendering based on filter */}
            {orderData.filter((category) =>
              orderStatus === "recent"
                ? true
                : category.orders.some((order) => order.status === orderStatus)
            ).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 text-lg">
                  {orderStatus === "recent"
                    ? "No orders available"
                    : orderStatus === "in-progress"
                    ? "No orders in progress"
                    : "No completed orders"}
                </p>
              </div>
            ) : (
              orderData
                .filter((category) =>
                  orderStatus === "recent"
                    ? true
                    : category.orders.some(
                        (order) => order.status === orderStatus
                      )
                )
                .map((category) => (
                  <div key={category.id} className="mb-6">
                    <h2 className="text-sm font-medium mb-3 text-gray-500 uppercase tracking-wider">
                      {category.category}
                    </h2>
                    {category.orders
                      .filter((order) =>
                        orderStatus === "recent"
                          ? true
                          : order.status === orderStatus
                      )
                      .map((data) => renderCard(data))}
                  </div>
                ))
            )}
          </>
        )}

        {activeTab === "orders" &&
          profileType === "provider" &&
          (orderData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 text-lg">No orders available</p>
            </div>
          ) : (
            orderData.map((category) => (
              <div key={category.id} className="mb-6">
                <h2 className="text-sm font-medium mb-3 text-gray-500 uppercase tracking-wider">
                  {category.category}
                </h2>
                {category.orders.map((order) => renderCard(order))}
              </div>
            ))
          ))}
      </>
    </div>
  );
};

export default OrdersTab;
