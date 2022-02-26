const axios = require("axios");

interface IBotData {
  description: string;
  footer: string;
  title: string;
  timestamp: number;
  mentions?: Array<number>;
}

export const sendMessageToCalobot = (data: IBotData) => {
  return axios.post(process.env.BASE_BOT_URL + "/message/embed", {
    author: {
      name: "Calomentor",
      iconURL:
        "https://cdn.discordapp.com/avatars/938137983243124736/8321279f2ca0d141ffd37f8ef8199ff5.webp?size=80",
    },
    description: data.description,
    color: "ff0000",
    URL: "",
    footer: {
      text: data.footer,
      iconURL:
        "https://cdn.discordapp.com/avatars/938137983243124736/8321279f2ca0d141ffd37f8ef8199ff5.webp?size=80",
    },
    image: "[https://i.imgur.com/XQ9xZ9u.png](https://i.imgur.com/XQ9xZ9u.png)",
    thumbnail:
      "[https://i.imgur.com/XQ9xZ9u.png](https://i.imgur.com/XQ9xZ9u.png)",
    title: data.title,
    timestamp: data.timestamp,
    mentions: data.mentions,
    channel: process.env.MENTORISHIP_NOTIFICATIONS_CHANNEL_ID,
  });
};

export const sendMessageUserToCalobot = (
  userId: string,
  data: IBotData,
  isEmbed = true
) => {
  return axios.post(process.env.BASE_BOT_URL + `/message/user/${userId}`, {
    author: {
      name: "Mentorship",
      iconURL:
        "[https://i.imgur.com/XQ9xZ9u.png](https://i.imgur.com/XQ9xZ9u.png)",
    },
    description: data.description,
    color: "ff0000",
    URL: "",
    footer: {
      text: data.footer,
      iconURL:
        "[https://i.imgur.com/XQ9xZ9u.png](https://i.imgur.com/XQ9xZ9u.png)",
    },
    image: "[https://i.imgur.com/XQ9xZ9u.png](https://i.imgur.com/XQ9xZ9u.png)",
    thumbnail:
      "[https://i.imgur.com/XQ9xZ9u.png](https://i.imgur.com/XQ9xZ9u.png)",
    title: data.title,
    timestamp: data.timestamp,
    channel: process.env.MENTORISHIP_NOTIFICATIONS_CHANNEL_ID,
    isEmbed: isEmbed,
  });
};

export const addRoleCalobot = (userId: string) => {
  return axios.post(process.env.BASE_BOT_URL + "/mentorship/addRole", {
    user: userId,
    role: process.env.MENTEE_ROLE_ID,
  });
};

export const removeRoleCalobot = (userId: string) => {
  return axios.post(process.env.BASE_BOT_URL + "/mentorship/removeRole", {
    user: userId,
    role: process.env.MENTEE_ROLE_ID,
  });
};
