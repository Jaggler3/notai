export type MessageType = 'info' | 'success' | 'error';

export class MessageDisplay {
  showMessage(message: string, type: MessageType = 'info'): void {
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type}`;
    messageElement.textContent = message;
    
    document.body.appendChild(messageElement);
    
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.parentNode.removeChild(messageElement);
      }
    }, 3000);
  }
}
