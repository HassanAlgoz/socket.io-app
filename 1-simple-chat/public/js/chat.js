window.addEventListener('load', () => {

    const socket = io()
    window.onunload = () => socket.close()

    const $messageInput = document.getElementById('messageInput');
    const $form = document.getElementById('messageForm')
    const $messagesContainer = document.getElementById('messagesContainer')
    
    // Send Message
    $form.addEventListener('submit', function(event) {
        event.preventDefault()
        let message = $messageInput.value;
        $messageInput.value = "";
        // Send
        socket.emit('msg', message)
    })

    // Recieve Message
    socket.on('msg', (data) => {
        if (data.from != socket.id) {
            say(data.from, data.message)
        } else {
            say('me', data.message)
        }
    })

    function say(name, message) {
        $messagesContainer.innerHTML +=
        `<div class="chat-message">
            <span style="color: red; font-weight: bold;">${name}:</span> ${message}
        </div>`
        // Scroll down to last message
        $messagesContainer.scrollTop = $messagesContainer.scrollHeight
    }
})