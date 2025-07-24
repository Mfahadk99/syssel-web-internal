import React from "react";

const ChatTabV1 = ({activeTab, activeFilter, setActiveFilter, renderActivityList}) => {
  
    return (
    <div>
      {activeTab === "chat" && (
        <>
          {/* Filter buttons */}
          <div className="flex justify-center gap-8 items-center mt-8 mb-6">
            <button
              className={`text-black px-4 py-2 bdata-b-2 ${
                activeFilter === "all"
                  ? "border-primary font-medium"
                  : "border-transparent hover:border-primary transition-all"
              }`}
              onClick={() => setActiveFilter("all")}
            >
              All
            </button>
            <button
              className={`text-black px-4 py-2 border-b-2 ${
                activeFilter === "stores"
                  ? "border-primary font-medium"
                  : "border-transparent hover:border-primary transition-all"
              }`}
              onClick={() => setActiveFilter("stores")}
            >
              Stores
            </button>
            <button
              className={`text-black px-4 py-2 border-b-2 ${
                activeFilter === "friends"
                  ? "border-primary font-medium"
                  : "border-transparent hover:border-primary transition-all"
              }`}
              onClick={() => setActiveFilter("friends")}
            >
              Friends
            </button>
          </div>

          {/* Activity list */}
          <div className="mt-2">{renderActivityList()}</div>
        </>
      )}
    </div>
  );
};

export default ChatTabV1;
