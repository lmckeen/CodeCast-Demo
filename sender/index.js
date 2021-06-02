import { CodeCast } from 'codecast/sender'

window['__onGCastApiAvailable'] = function(isAvailable) {
  if (isAvailable && cast) {
    cast.framework.CastContext.getInstance().setOptions({
      receiverApplicationId: '8FD9262C',
      autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
    })

    const player = new cast.framework.RemotePlayer()
    const controller = new cast.framework.RemotePlayerController(player)
    const events = cast.framework.RemotePlayerEventType
    const defaultCode = `const context = cast.framework.CastReceiverContext.getInstance()
const manager = context.getPlayerManager()

manager.load({
  autoplay:true,
  media: {
    contentUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
  }
}).then(() => {
  resolve('Content loaded successfully')
}).catch(e => {
  reject(\`Content failed to load: \${JSON.stringify(e)}\`)
})`

    const codeCast = new CodeCast()
    const codeInput = document.querySelector('.code')
    const code = sessionStorage.getItem('codecast') || defaultCode
    
    codeInput.value = code

    controller.addEventListener(events.IS_CONNECTED_CHANGED, () => {
      sendCode(codeCast, code)
    })

    document.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
        sessionStorage.setItem('codecast', codeInput.value)
      
        codeCast.reload()
        sendCode(codeCast, codeInput.value)
      } else if (event.code === 'Tab') {
        const code = codeInput.value
        const beforeCode = code.substring(0, codeInput.selectionStart)
        const afterCode = code.substring(codeInput.selectionEnd, code.length)

        codeInput.value = `${beforeCode}  ${afterCode}`
        
        const newCursorPosition = codeInput.value.length - afterCode.length
        codeInput.setSelectionRange(newCursorPosition, newCursorPosition);
      } else {
        return
      }

      event.preventDefault();
    })
  }
}

function appendToConsole(color, value) {
  const option = document.createElement('option')
  const logs = document.querySelector('.logs')
  
  option.innerText = value
  option.disabled = true
  option.style.background = color

  logs.append(option)
  logs.scrollTop = logs.scrollHeight
}

function sendCode(codeCast, code) {
  codeCast.sendString(code)
    .then(data => {
      console.log(data)
      appendToConsole('transparent', data)
    })
    .catch(error => {
      console.error(error)
      appendToConsole('rgba(255, 0, 0, 0.2)', error)
    })
}
