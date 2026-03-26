export const formatTime = (timestamp) => {
  if (!timestamp) return "";

  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
};


export const formatDateTime = (timestamp) => {
  if (!timestamp) return "";

  return new Date(timestamp).toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short"
  });
};


export const timeAgo = (timestamp) => {
  if (!timestamp) return "";

  const seconds =
    Math.floor((new Date() - new Date(timestamp)) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (let key in intervals) {
    const value =
      Math.floor(seconds / intervals[key]);

    if (value >= 1) {
      return `${value} ${key}${value > 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
};