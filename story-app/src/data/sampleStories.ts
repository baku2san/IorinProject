// Sample story data for development
import { Story } from '../types';

/**
 * サンプルストーリーデータ
 * アプリケーションの開発とテストに使用する物語データ
 */
export const sampleStories: Story[] = [
  {
    id: 'mystery-mansion',
    title: '謎の洋館',
    description: '古い洋館に招待された主人公。しかし、そこで待っていたのは予想外の謎と危険だった...',
    thumbnail: '/images/mystery-mansion.svg',
    startSceneId: 'mansion-entrance',
    scenes: [
      {
        id: 'mansion-entrance',
        text: '雨の中、あなたは招待状に書かれた住所の洋館に到着しました。大きな木製のドアの前に立っています。',
        background: '/backgrounds/mansion-exterior.svg',
        choices: [
          {
            id: 'knock-door',
            text: 'ドアをノックする',
            nextSceneId: 'mansion-hall'
          },
          {
            id: 'check-window',
            text: '窓から中を覗く',
            nextSceneId: 'mansion-window'
          }
        ]
      },
      {
        id: 'mansion-hall',
        text: 'ドアをノックすると、不気味な音を立てて自然に開きました。広々とした玄関ホールが見えます。',
        background: '/backgrounds/mansion-hall.svg',
        choices: [
          {
            id: 'enter-hall',
            text: '中に入る',
            nextSceneId: 'mansion-meeting'
          },
          {
            id: 'leave-mansion',
            text: '立ち去る',
            nextSceneId: 'mansion-leave'
          }
        ]
      },
      {
        id: 'mansion-window',
        text: '窓から中を覗くと、薄暗い室内が見えます。何かが動いたような気がしました。',
        background: '/backgrounds/mansion-window-view.svg',
        choices: [
          {
            id: 'go-to-door',
            text: 'ドアに戻る',
            nextSceneId: 'mansion-entrance'
          },
          {
            id: 'break-window',
            text: '窓を割って入る',
            nextSceneId: 'mansion-break-in'
          }
        ]
      },
      {
        id: 'mansion-meeting',
        text: 'ホールに足を踏み入れると、ドアが背後で閉まりました。正面の階段の上に、黒いドレスを着た女性が立っています。「お待ちしていました」と彼女は言いました。',
        background: '/backgrounds/mansion-hall-meeting.svg',
        characters: [
          {
            id: 'mysterious-lady',
            name: '謎の女性',
            avatar: '/characters/mysterious-lady.svg',
            position: 'center'
          }
        ],
        choices: [
          {
            id: 'ask-invitation',
            text: '招待状について尋ねる',
            nextSceneId: 'mansion-invitation-talk'
          },
          {
            id: 'look-around',
            text: '周囲を見回す',
            nextSceneId: 'mansion-hall-investigation'
          }
        ]
      },
      {
        id: 'mansion-break-in',
        text: 'あなたは窓を割って中に入りました。ガラスの破片が床に散らばっています。物音を聞きつけて、誰かが近づいてきます。',
        background: '/backgrounds/mansion-broken-window.svg',
        choices: [
          {
            id: 'hide-quickly',
            text: '急いで隠れる',
            nextSceneId: 'mansion-hiding'
          },
          {
            id: 'confront',
            text: '正面から対峙する',
            nextSceneId: 'mansion-confrontation'
          }
        ]
      },
      {
        id: 'mansion-leave',
        text: '不気味な雰囲気に身震いし、あなたは立ち去ることにしました。しかし、車に戻ろうとすると、見知らぬ人物があなたの前に立ちはだかります。',
        background: '/backgrounds/mansion-exterior-night.svg',
        characters: [
          {
            id: 'stranger',
            name: '見知らぬ人物',
            avatar: '/characters/stranger.svg',
            position: 'center'
          }
        ],
        choices: [
          {
            id: 'talk-stranger',
            text: '話しかける',
            nextSceneId: 'mansion-stranger-talk'
          },
          {
            id: 'run-away',
            text: '逃げる',
            nextSceneId: 'mansion-escape'
          }
        ]
      },
      {
        id: 'mansion-invitation-talk',
        text: '「招待状について教えてください」とあなたは尋ねました。女性は微笑み、「あなたは特別なゲストです。この館の秘密を解き明かす鍵を持っているのです」と答えました。',
        background: '/backgrounds/mansion-hall-meeting.svg',
        characters: [
          {
            id: 'mysterious-lady',
            name: '謎の女性',
            avatar: '/characters/mysterious-lady.svg',
            position: 'center'
          }
        ],
        choices: [
          {
            id: 'ask-secret',
            text: '秘密について詳しく尋ねる',
            nextSceneId: 'mansion-secret-talk'
          },
          {
            id: 'follow-lady',
            text: '女性について行く',
            nextSceneId: 'mansion-follow'
          }
        ]
      },
      {
        id: 'mansion-hall-investigation',
        text: 'ホールを見回すと、古い絵画や骨董品が飾られています。特に目を引くのは、暖炉の上に飾られた不思議な時計です。',
        background: '/backgrounds/mansion-hall-detail.svg',
        clickableElements: [
          {
            id: 'strange-clock',
            x: 300,
            y: 200,
            width: 100,
            height: 100,
            action: 'examine-clock',
            tooltip: '不思議な時計'
          }
        ],
        choices: [
          {
            id: 'examine-paintings',
            text: '絵画を調べる',
            nextSceneId: 'mansion-paintings'
          },
          {
            id: 'talk-to-lady',
            text: '女性に話しかける',
            nextSceneId: 'mansion-invitation-talk'
          }
        ]
      }
    ]
  },
  {
    id: 'space-adventure',
    title: '宇宙冒険記',
    description: '宇宙船のパイロットとなり、未知の惑星を探索する冒険に出よう！',
    thumbnail: '/images/space-adventure.svg',
    startSceneId: 'space-station',
    scenes: [
      {
        id: 'space-station',
        text: '宇宙ステーションのコントロールルームにいます。次のミッションの準備をしています。',
        background: '/backgrounds/space-station.svg',
        choices: [
          {
            id: 'start-mission',
            text: 'ミッションを開始する',
            nextSceneId: 'space-travel'
          },
          {
            id: 'check-equipment',
            text: '装備を確認する',
            nextSceneId: 'equipment-check'
          }
        ]
      },
      {
        id: 'space-travel',
        text: 'あなたは宇宙船に乗り込み、未知の惑星X-9に向けて出発しました。宇宙空間を航行中、突然警報が鳴り響きます。',
        background: '/backgrounds/space-travel.svg',
        choices: [
          {
            id: 'check-alert',
            text: '警報を確認する',
            nextSceneId: 'space-alert'
          },
          {
            id: 'ignore-alert',
            text: '警報を無視して進む',
            nextSceneId: 'space-continue'
          }
        ]
      },
      {
        id: 'equipment-check',
        text: '装備を確認します。宇宙服、生命維持装置、通信機器、武器などが揃っています。何か特別なアイテムを持っていくべきでしょうか？',
        background: '/backgrounds/space-equipment.svg',
        choices: [
          {
            id: 'take-weapon',
            text: '追加の武器を持っていく',
            nextSceneId: 'space-weapon'
          },
          {
            id: 'take-medkit',
            text: '医療キットを持っていく',
            nextSceneId: 'space-medkit'
          },
          {
            id: 'start-mission-now',
            text: '現在の装備でミッション開始',
            nextSceneId: 'space-travel'
          }
        ]
      },
      {
        id: 'space-alert',
        text: '警報を確認すると、小惑星群が接近していることがわかりました。回避行動が必要です。',
        background: '/backgrounds/space-asteroid.svg',
        miniGame: {
          gameId: 'asteroid-dodge',
          condition: {
            type: 'variable',
            key: 'pilotSkill',
            operator: '>=',
            value: 3
          }
        },
        choices: [
          {
            id: 'manual-control',
            text: '手動操縦に切り替える',
            nextSceneId: 'space-manual-control'
          },
          {
            id: 'auto-pilot',
            text: 'オートパイロットに任せる',
            nextSceneId: 'space-auto-pilot'
          }
        ]
      },
      {
        id: 'space-manual-control',
        text: '手動操縦に切り替えました。小惑星を避けるために操縦技術が試されます。',
        background: '/backgrounds/space-cockpit.svg',
        miniGame: {
          gameId: 'reflex-game',
          condition: {
            type: 'variable',
            key: 'pilotSkill',
            operator: '>=',
            value: 3
          }
        }
      }
    ]
  },
  {
    id: 'fantasy-quest',
    title: 'ファンタジー・クエスト',
    description: '魔法の世界で冒険者となり、失われた宝物を探す旅に出よう！',
    thumbnail: '/images/fantasy-quest.svg',
    startSceneId: 'village-start',
    scenes: [
      {
        id: 'village-start',
        text: 'あなたは小さな村の広場にいます。村長があなたを呼び、重要な任務を与えようとしています。',
        background: '/backgrounds/fantasy-village.svg',
        characters: [
          {
            id: 'village-elder',
            name: '村長',
            avatar: '/characters/village-elder.svg',
            position: 'center'
          }
        ],
        choices: [
          {
            id: 'accept-quest',
            text: 'クエストを受ける',
            nextSceneId: 'quest-briefing'
          },
          {
            id: 'ask-details',
            text: '詳細を尋ねる',
            nextSceneId: 'quest-details'
          },
          {
            id: 'decline-quest',
            text: 'クエストを断る',
            nextSceneId: 'quest-declined'
          }
        ]
      },
      {
        id: 'quest-briefing',
        text: '「我々の村を救うためには、古代の魔法の宝石を見つけなければならない。それは暗い森の奥深くにある洞窟に隠されていると言われている」と村長は説明しました。',
        background: '/backgrounds/fantasy-village.svg',
        characters: [
          {
            id: 'village-elder',
            name: '村長',
            avatar: '/characters/village-elder.svg',
            position: 'center'
          }
        ],
        choices: [
          {
            id: 'go-to-forest',
            text: '森へ向かう',
            nextSceneId: 'dark-forest'
          },
          {
            id: 'prepare-first',
            text: '準備をしてから出発する',
            nextSceneId: 'village-preparation'
          }
        ]
      },
      {
        id: 'dark-forest',
        text: '暗い森に足を踏み入れると、周囲は不気味な静けさに包まれています。木々の間から何かの目が光っているような気がします。',
        background: '/backgrounds/dark-forest.svg',
        choices: [
          {
            id: 'follow-path',
            text: '小道を進む',
            nextSceneId: 'forest-path'
          },
          {
            id: 'investigate-sound',
            text: '物音を調査する',
            nextSceneId: 'forest-creature'
          }
        ]
      }
    ]
  }
];