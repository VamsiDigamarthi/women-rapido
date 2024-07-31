import ChatModel from "../Modals/ChatModal.js";

async function checkChatExists(user1Id, user2Id) {
  try {
    // Query the Chat model to find if there's a chat containing both user IDs
    const chat = await ChatModel.findOne({
      members: {
        $all: [user1Id, user2Id],
      },
    });

    // If chat exists, return true
    if (chat) {
      // console.log("chat is presents");
      return true;
    } else {
      // console.log("Chat doesn't exist");
      return false; // Chat doesn't exist
    }
  } catch (error) {
    console.error("Error checking chat:", error);
    return false; // Handle error
  }
}

export const createChat = async (req, res) => {
  const { user } = req;

  // const chatExists = await checkChatExists(user._id, req.body.receiverId);
  // if (chatExists) {
  //   return res.status(200).json("Chat already exists");
  // }

  const newChat = new ChatModel({
    members: [user._id, req.body.receiverId],
  });

  try {
    const result = await newChat.save();
    res.status(200).json({ message: "Chat created successfully...!", result });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const userChats = async (req, res) => {
  const { user } = req;
  try {
    const chat = await ChatModel.find({
      members: { $in: [user._id] },
    }).select("members");
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const findChat = async (req, res) => {
  const { user } = req;
  try {
    const chat = await ChatModel.findOne({
      members: { $all: [user._id, req.params.receiverId] },
    });
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json(error);
  }
};
