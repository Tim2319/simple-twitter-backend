const generateMessage = (text, userId, profilePic, isNew) => {
  console.log('generateMessage function')
  console.log('isNew', isNew)
  return {
    text: String(text),
    userId,
    profilePic,
    isNew,
    createdAt: Date.now()
  }
}

module.exports = {
  generateMessage
}
