import type { InlineKeyboardMarkup, InputFile, Message } from 'grammy/types'
import type { InstallFn } from '.'

export type File = string | InputFile
export type Keyboard = InlineKeyboardMarkup
export type ChatId = number | string

export type MessageContent = {
  type: 'text'
  text: string
  keyboard?: Keyboard
} | {
  type: 'photo'
  photo: File
  caption?: string
  keyboard?: Keyboard
}

export type MessageSendingFlavor = {
  sendMessage: (options: {
    chatId: ChatId
    threadId?: number
    content: MessageContent
  }) => Promise<Message>
  editMessage: (options: {
    chatId: ChatId
    messageId: number
    content: MessageContent
  }) => Promise<Message>
}

export const install: InstallFn<MessageSendingFlavor> = (bot) => {
  bot.use((ctx, next) => {
    ctx.editMessage = async ({ chatId, messageId, content }) => {
      switch (content.type) {
        case 'text': {
          const editedMessage = await ctx.api.editMessageText(
            chatId,
            messageId,
            content.text,
            {
              ...(content.keyboard
                ? { reply_markup: content.keyboard }
                : {}
              ),
            },
          )
          if (typeof editedMessage === 'boolean') {
            // eslint-disable-next-line unicorn/prefer-type-error
            throw new Error('Inline message was edited')
          }
          return editedMessage
        }
        case 'photo': {
          const editedMessage = await ctx.api.editMessageMedia(
            chatId,
            messageId,
            {
              type: 'photo',
              media: content.photo,
              ...(content.caption !== undefined
                ? { caption: content.caption }
                : {}
              ),
            },
          )
          if (typeof editedMessage === 'boolean') {
            // eslint-disable-next-line unicorn/prefer-type-error
            throw new Error('Inline message was edited')
          }
          return editedMessage
        }
        default: {
          throw new Error(`Unsupported message type: ${content satisfies never}`)
        }
      }
    }

    ctx.sendMessage = async ({ chatId, threadId, content }) => {
      switch (content.type) {
        case 'text':
          return await ctx.api.sendMessage(chatId, content.text, {
            ...(content.keyboard
              ? { reply_markup: content.keyboard }
              : {}
            ),
            ...(threadId !== undefined
              ? { reply_to_message_id: threadId }
              : {}
            ),
          })
        case 'photo':
          return await ctx.api.sendPhoto(chatId, content.photo, {
            ...(content.caption !== undefined
              ? { caption: content.caption }
              : {}
            ),
            ...(content.keyboard
              ? { reply_markup: content.keyboard }
              : {}
            ),
            ...(threadId !== undefined
              ? { reply_to_message_id: threadId }
              : {}
            ),
          })
        default:
          throw new Error(`Unsupported message type: ${content satisfies never}`)
      }
    }

    return next()
  })
}
