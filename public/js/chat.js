 const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocation = document.querySelector('#send-location')
const $message = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

socket.on('message', (message) => {
    console.log(message)
    const html= Mustache.render(messageTemplate,{
      message: message.text ,
      createdAt : moment(message.createdAt).format('hh:mm a')
    })
    $message.insertAdjacentHTML('beforeend',html)
})

socket.on('locationMessage', (message) => {
    console.log(message)

    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('hh:mm a')
    })

    $message.insertAdjacentHTML('beforeend',html)
})

$messageForm.addEventListener('submit',(e)=> {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.message.value
    socket.emit('sendMessage',message, (error)=> {

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value =''
        $messageFormInput.focus()
       if(error){
           return console.log(error)
       }

       console.log('Message delivered')
    })
})

$sendLocation.addEventListener('click', ()=> {
    
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by browser')
    }

    navigator.geolocation.getCurrentPosition((position) => {

        $sendLocation.setAttribute('disabled','disabled')
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, ()=> {
            $sendLocation.removeAttribute('disabled')
            console.log('Location shared')
        })
    })
})

socket.emit('join', {username, room}, (error) => {
    if(error){
        alert(error)
        location.href ='/'
    }
})