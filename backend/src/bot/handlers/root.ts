import commands from './commands'
import { handler } from '.'

export default handler((composer) => {
  composer.use(commands.start)
  composer.use(commands.howgoodami)
})
