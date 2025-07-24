"use client";
import React, { useState } from "react";
import Activity from "../Activity/Activity";
import { Archive, X } from "lucide-react";
import { useGetNotificationsById } from "@/app/hooks/useNotification";
import Header from "../Header/Header";

const Notifications = ({ id }) => {
  const { data: notificationsData } = useGetNotificationsById(id);

  // State for managing archived notifications and modal
  const [archivedNotifications, setArchivedNotifications] = useState([]);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  const archiveAllNotifications = () => {
    if (!notificationsData || !notificationsData.notifications) return;

    // Format notifications for archive
    const notificationsToArchive = notificationsData.notifications.map(
      (notification, index) => ({
        id: notification._id || index + 100,
        name: notification.user?.name || "Unknown User",
        avatar: "/images/avatars/default.jpg",
        message: `${notification.title}: ${notification.body}`,
        archivedAt: new Date().toISOString(),
        originalCreatedAt: notification.createdAt,
      })
    );

    // Add to archived notifications
    setArchivedNotifications((prev) => [...prev, ...notificationsToArchive]);

    // Here you would typically make an API call to archive notifications
    console.log("All notifications archived:", notificationsToArchive);
  };

  const optionButtonsData = [
    {
      text: "Archive All",
      icon: <Archive size={16} />,
      onClick: archiveAllNotifications,
      iconClassName: "text-gray-500",
    },
    {
      text: "View Archived",
      icon: <Archive size={16} />,
      onClick: () => setIsArchiveModalOpen(true),
      iconClassName: "text-gray-500",
    },
  ];

  const formatNotifications = () => {
    if (!notificationsData || !notificationsData.notifications) {
      return [];
    }

    // Filter out archived notifications (in a real app, this would come from the API)
    const archivedIds = archivedNotifications.map((n) => n.id);
    const activeNotifications = notificationsData.notifications.filter(
      (notification, index) =>
        !archivedIds.includes(notification._id || index + 100)
    );

    // Create date categories
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);

    // Group notifications by date
    const todayNotifications = [];
    const thisWeekNotifications = [];
    const olderNotifications = [];

    activeNotifications.forEach((notification, index) => {
      const notificationDate = new Date(notification.createdAt);
      const formattedNotification = {
        id: notification._id || index + 100,
        name: notification.user?.name || "Unknown User",
        avatar: "/images/avatars/default.jpg",
        message: `${notification.title}: ${notification.body}`,
        unread: true,
      };

      if (notificationDate.setHours(0, 0, 0, 0) === today.getTime()) {
        formattedNotification.time = new Date(
          notification.createdAt
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        todayNotifications.push(formattedNotification);
      } else if (notificationDate >= oneWeekAgo) {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        formattedNotification.time = days[notificationDate.getDay()];
        thisWeekNotifications.push(formattedNotification);
      } else {
        formattedNotification.time = notificationDate.toLocaleDateString([], {
          day: "numeric",
          month: "short",
        });
        olderNotifications.push(formattedNotification);
      }
    });

    const result = [];

    if (todayNotifications.length > 0) {
      result.push({
        id: 1,
        category: "today",
        messages: todayNotifications,
      });
    }

    if (thisWeekNotifications.length > 0) {
      result.push({
        id: 2,
        category: "this week",
        messages: thisWeekNotifications,
      });
    }

    if (olderNotifications.length > 0) {
      result.push({
        id: 3,
        category: "older",
        messages: olderNotifications,
      });
    }

    return result;
  };

  const formatArchivedNotifications = () => {
    if (archivedNotifications.length === 0) return [];

    // Group archived notifications by archive date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayArchived = [];
    const olderArchived = [];

    archivedNotifications.forEach((notification) => {
      const archivedDate = new Date(notification.archivedAt);
      const formattedNotification = {
        ...notification,
        time: archivedDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      if (archivedDate.setHours(0, 0, 0, 0) === today.getTime()) {
        todayArchived.push(formattedNotification);
      } else {
        formattedNotification.time = archivedDate.toLocaleDateString([], {
          day: "numeric",
          month: "short",
        });
        olderArchived.push(formattedNotification);
      }
    });

    const result = [];

    if (todayArchived.length > 0) {
      result.push({
        id: 1,
        category: "archived today",
        messages: todayArchived,
      });
    }

    if (olderArchived.length > 0) {
      result.push({
        id: 2,
        category: "previously archived",
        messages: olderArchived,
      });
    }

    return result;
  };

  const removeFromArchive = (notificationId) => {
    setArchivedNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  };

  const clearAllArchived = () => {
    setArchivedNotifications([]);
  };

  const notifications = formatNotifications();
  const archivedData = formatArchivedNotifications();

  const archiveModalButtons = [
    {
      text: "Clear All",
      icon: <X size={16} />,
      onClick: clearAllArchived,
      iconClassName: "text-red-500",
    },
  ];

  console.log("notifications", notifications);

  return (
    <div className="w-[95%] mx-auto mt-3">
      <Header heading={{ title: "Notifications" }} showSearchBar={true} />
      {notifications.length > 0 ? (
        <Activity
          activityData={notifications}
          heading={"Notifications"}
          searchBar={false}
          optionButtonsData={optionButtonsData}
          optionButtonTitle="Notifications Options"
        />
      ) : (
        <div className="p-8 text-center text-gray-500">
          <p>No notifications</p>
        </div>
      )}

      {/* Archive Modal */}
      {isArchiveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Archived Notifications ({archivedNotifications.length})
              </h2>
              <button
                onClick={() => setIsArchiveModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[60vh]">
              {archivedNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Archive size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No archived notifications</p>
                </div>
              ) : (
                <div className="p-4">
                  <Activity
                    activityData={archivedData}
                    heading=""
                    searchBar={false}
                    optionButtonsData={archiveModalButtons}
                    optionButtonTitle="Archive Options"
                    onItemAction={(item) => removeFromArchive(item.id)}
                    itemActionText="Restore"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
