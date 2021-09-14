import {Telegraf} from 'telegraf'
import {ApplicationCollection} from '~/collection'
import {ApplicationConfig} from '~/config'

export default (
  config: ApplicationConfig,
  collection: ApplicationCollection,
  telegraf: Telegraf,
) => {
  telegraf.on('new_chat_members', async ctx => {
    const myself = ctx.update.message.new_chat_members.find(
      member => member.is_bot && member.username === config.telegramBotUsername,
    )

    if (myself) {
      let document = await collection.telegram.load()

      if (!document) {
        document = {
          chats: [],
        }
      }

      if (document.chats.indexOf(ctx.chat.id) === -1) {
        document.chats.push(ctx.chat.id)
      }

      await collection.telegram.update(document)
      await ctx.reply(`\
Приветствую!
Я - гидралиск из логова Санфейма.
Буду вас всех держать в курсе, когда Ярик подрубит 📺

Пока что я умею только оповещать о стримах Ярика, но мой функционал можно дополнить здесь
https://github.com/metsawyr/sunfame-den`)
    } else {
      const newMembers = ctx.update.message.new_chat_members
      const isOneMember = newMembers.length === 1
      await ctx.replyWithPoll(
        `Что сдела${isOneMember ? 'е' : 'ю'}т ${newMembers.reduce(
          (accumulator, member, i) =>
            accumulator +
            (i === 0 ? '' : i === newMembers.length - 1 ? ' и ' : ', ') +
            member.first_name,
          '',
        )} в первую очередь?`,
        [
          `Поздорова${isOneMember ? 'е' : 'ю'}тся`,
          `Промолч${isOneMember ? 'и' : 'а'}т`,
          `Буд${
            isOneMember ? 'е' : 'у'
          }т совершать сексуальные девиации с родителями других участников`,
          `Буд${
            isOneMember ? 'е' : 'у'
          }т совершать сексуальные девиации с другими участниками`,
        ],
      )
    }
  })

  telegraf.on('left_chat_member', async ctx => {
    const member = ctx.update.message.left_chat_member

    if (member.is_bot && member.username === config.telegramBotUsername) {
      const document = await collection.telegram.load()

      const currentChatIndex = document!.chats.indexOf(ctx.chat.id)
      if (currentChatIndex !== -1) {
        document!.chats.splice(currentChatIndex, 1)
      }

      await collection.telegram.update(document!)
    }
  })
}
