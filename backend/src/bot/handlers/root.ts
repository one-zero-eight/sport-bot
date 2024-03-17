import commands from './commands'
import views from './views'
import { handler } from '.'

export default handler((composer) => {
  composer.use(views.main)
  composer.use(views.settings)
  composer.use(views.settingsLanguage)

  composer.use(commands.start)
  composer.use(commands.howgoodami)
})
