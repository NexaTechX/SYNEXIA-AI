// DOM Elements
const btn = document.querySelector('.talk');
const content = document.querySelector('.content');
const chatArea = document.querySelector('.chat-area'); // Chat area container
const robotImage = document.querySelector('.image img'); // Robot image
const voiceSelect = document.querySelector('.voice-select'); // Dropdown for voice selection

let userName = localStorage.getItem('userName') || ''; // Load user's name from localStorage
let voices = [];
let currentVoice = null;
let currentVoiceType = "male"; // Default voice type

// Load available voices
function loadVoices() {
    voices = window.speechSynthesis.getVoices();
    console.log("Available voices:", voices); // Log available voices

    // Populate the voice selection dropdown
    voiceSelect.innerHTML = voices.map(voice => `<option value="${voice.name}">${voice.name}</option>`).join('');
    currentVoice = voices.find(voice => voice.name.toLowerCase().includes(currentVoiceType)) || voices[0]; // Default to first voice if none match
    voiceSelect.value = currentVoice.name; // Set the dropdown value
}

// Update current voice based on selection
voiceSelect.addEventListener('change', () => {
    currentVoice = voices.find(voice => voice.name === voiceSelect.value) || voices[0];
    console.log("Current voice:", currentVoice); // Log the selected voice
});

// Function to speak a text
function speak(text) {
    // Stop any ongoing speech
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel(); // Stop any ongoing speech synthesis
    }

    console.log("Speaking:", text); // Log the text being spoken
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = currentVoice;

    robotImage.classList.add('speaking'); // Speaking animation
    window.speechSynthesis.speak(utterance);

    // Display the bot's text response
    const botMessage = document.createElement('div');
    botMessage.classList.add('message', 'bot-message', 'bg-green-100', 'text-green-800', 'p-2', 'rounded-lg', 'mb-2'); // Add classes for styling
    botMessage.textContent = `SYNEXIA: ${text}`;
    chatArea.appendChild(botMessage); // Append to the chat area
    chatArea.scrollTop = chatArea.scrollHeight; // Scroll to the bottom

    utterance.onend = () => {
        robotImage.classList.remove('speaking');
        console.log("Speech has ended."); // Log when speech ends
    };
}

// Handle speech recognition results
recognition.onresult = async (event) => {
    const query = event.results[0][0].transcript.toLowerCase().trim();
    const userMessage = document.createElement('div');
    userMessage.classList.add('message', 'user-message', 'bg-blue-100', 'text-blue-800', 'p-2', 'rounded-lg', 'mb-2'); // Add classes for styling
    userMessage.textContent = `You: ${query}`;
    chatArea.appendChild(userMessage); // Append to the chat area
    chatArea.scrollTop = chatArea.scrollHeight; // Scroll to the bottom

    // Log the query sent to API
    console.log("Query sent to API:", query);

    // Process command and fetch response logic as previously defined
    // ...
};

// Start listening for speech when the button is clicked
btn.addEventListener('click', () => {
    recognition.start();
    speak("Listening...");
});

// Load voices on page load
window.speechSynthesis.onvoiceschanged = loadVoices;

// Greet the user when the page loads
window.addEventListener('load', () => {
    speak("Initializing SYNEXIA...");
    askForName(); // Always ask for the user's name on page load
});
