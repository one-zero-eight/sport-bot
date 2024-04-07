export function InnohassleLoginButton({
  loginUrl: loginUrlStr,
  loginBotUsername,
  returnBotUsername,
  children,
}: {
  loginUrl: string
  loginBotUsername: string
  returnBotUsername: string
  children: string
}) {
  const loginUrl = new URL(loginUrlStr)
  loginUrl.searchParams.set('bot', `${returnBotUsername}?start=_`)
  return (
    <button
      loginUrl={{
        url: loginUrl.toString(),
        bot_username: loginBotUsername,
      }}
    >
      {children}
    </button>
  )
}
