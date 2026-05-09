(function() {
  // Restore config from localStorage if available
  const savedConfig = localStorage.getItem('chatbotConfig');
  if (savedConfig) {
    try {
      const config = JSON.parse(savedConfig);
      window.ChatbotConfig = window.ChatbotConfig || config;
    } catch (e) {
      console.error('Chatbot: Error parsing saved config', e);
    }
  }

  // Save current config to localStorage for persistence
  if (window.ChatbotConfig) {
    localStorage.setItem('chatbotConfig', JSON.stringify(window.ChatbotConfig));
  }

  // Get config from script tag or window variable
  var botUrl = window.CHATBOT_URL || 'https://chatbot-demo-virid.vercel.app';
  
  // Pass configuration to the iframe if available
  const config = window.ChatbotConfig || {};
  const urlParams = new URLSearchParams();
  
  // Propagate setup mode if present in parent URL
  const parentParams = new URLSearchParams(window.location.search);
  if (parentParams.get('setup') === 'true') urlParams.append('setup', 'true');
  
  if (config.websiteUrl) urlParams.append('websiteUrl', config.websiteUrl);
  if (config.businessName) urlParams.append('businessName', config.businessName);
  if (config.sheetUrl) urlParams.append('sheetUrl', config.sheetUrl);
  
  const queryString = urlParams.toString();
  if (queryString) {
    botUrl += (botUrl.includes('?') ? '&' : '?') + queryString;
  }

  var brandColor = window.CHATBOT_COLOR || '#4F46E5';
  var position = window.CHATBOT_POSITION || 'right';

  // Inject styles
  var style = document.createElement('style');
  style.innerHTML = `
    #smartoffice-bubble {
      position: fixed;
      bottom: 24px;
      ${position}: 24px;
      width: 56px;
      height: 56px;
      background: ${brandColor};
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      z-index: 99998;
      transition: transform 0.2s, box-shadow 0.2s;
      animation: pulse 2.5s infinite;
    }
    #smartoffice-bubble:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 28px rgba(0,0,0,0.3);
      animation: none;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(79,70,229,0.4); }
      70% { box-shadow: 0 0 0 12px rgba(79,70,229,0); }
      100% { box-shadow: 0 0 0 0 rgba(79,70,229,0); }
    }
    #smartoffice-badge {
      position: fixed;
      bottom: 82px;
      ${position}: 16px;
      background: white;
      color: #333;
      font-size: 12px;
      font-family: system-ui, sans-serif;
      padding: 6px 12px;
      border-radius: 20px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.15);
      z-index: 99997;
      white-space: nowrap;
      animation: fadeIn 0.3s ease;
    }
    #smartoffice-badge::after {
      content: '';
      position: absolute;
      bottom: -6px;
      ${position}: 28px;
      width: 12px;
      height: 12px;
      background: white;
      transform: rotate(45deg);
      box-shadow: 2px 2px 4px rgba(0,0,0,0.05);
    }
    #smartoffice-iframe-container {
      position: fixed;
      bottom: 90px;
      ${position}: 24px;
      width: 380px;
      height: 580px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.18);
      z-index: 99999;
      display: none;
      overflow: hidden;
      animation: slideUp 0.3s ease;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    #smartoffice-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    #smartoffice-close {
      position: absolute;
      top: 10px;
      ${position === 'right' ? 'left' : 'right'}: 10px;
      width: 28px;
      height: 28px;
      background: rgba(0,0,0,0.15);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 14px;
      color: white;
      z-index: 100000;
      transition: background 0.2s;
    }
    #smartoffice-close:hover { background: rgba(0,0,0,0.3); }
    @media (max-width: 480px) {
      #smartoffice-iframe-container {
        width: calc(100vw - 16px);
        height: calc(100vh - 100px);
        bottom: 80px;
        ${position}: 8px;
      }
    }
  `;
  document.head.appendChild(style);

  // Create bubble
  var bubble = document.createElement('div');
  bubble.id = 'smartoffice-bubble';
  bubble.innerHTML = '🤖';
  bubble.title = 'Chat with us';
  document.body.appendChild(bubble);

  // Create tooltip badge
  var badge = document.createElement('div');
  badge.id = 'smartoffice-badge';
  badge.innerHTML = '💬 Need help? Ask me!';
  document.body.appendChild(badge);

  // Hide badge after 5 seconds
  setTimeout(function() {
    badge.style.display = 'none';
  }, 5000);

  // Create iframe container
  var container = document.createElement('div');
  container.id = 'smartoffice-iframe-container';

  var closeBtn = document.createElement('div');
  closeBtn.id = 'smartoffice-close';
  closeBtn.innerHTML = '✕';

  var iframe = document.createElement('iframe');
  iframe.id = 'smartoffice-iframe';
  iframe.src = botUrl;
  iframe.allow = 'microphone';

  container.appendChild(closeBtn);
  container.appendChild(iframe);
  document.body.appendChild(container);

  // Toggle logic
  var isOpen = false;
  function toggleChat() {
    isOpen = !isOpen;
    container.style.display = isOpen ? 'block' : 'none';
    bubble.innerHTML = isOpen ? '✕' : '🤖';
    badge.style.display = 'none';
    if (isOpen) container.style.animation = 'slideUp 0.3s ease';
  }

  bubble.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);
})();
