import { handleMediaUpload } from '../utils/media';
import { useState } from 'react';

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat) return;

    handleMediaUpload(file);
    setSelectedChat('some value'); // Use setSelectedChat
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} />
      <button onClick={() => setSelectedChat('some value')}>Update Selected Chat</button>
    </div>
  );
};

export default Chat;