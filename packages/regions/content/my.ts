import { RegionContent } from './types';

export const MY_CONTENT: RegionContent = {
  industries: {
    food: {
      taglines: [
        {
          en: 'Fresh flavours and neighborhood hospitality in every plate.',
          ms: 'Rasa segar dan layanan mesra dalam setiap hidangan.',
          'zh-CN': '每一道菜都带着新鲜风味与亲切服务。',
          'zh-TW': '每一道菜都帶著新鮮風味與親切服務。',
        },
        {
          en: 'Comfort food, local favourites, and space to linger.',
          ms: 'Hidangan selesa, kegemaran tempatan, ruang untuk santai.',
          'zh-CN': '熟悉的本地味道，让人愿意多停留一会儿。',
          'zh-TW': '熟悉的在地味道，讓人願意多停留一會兒。',
        },
      ],
      cta: {
        en: 'View Menu',
        ms: 'Lihat Menu',
        'zh-CN': '查看菜单',
        'zh-TW': '查看菜單',
      },
      menu: {
        en: [
          {
            category: 'Signature Favourites',
            items: [
              {
                name: 'Chef Special',
                description: 'A balanced house favourite prepared fresh every day.',
                price: 'RM18',
                popular: true,
              },
              {
                name: 'Weekend Sharing Plate',
                description: 'Ideal for small groups with classic local flavours.',
                price: 'RM28',
              },
            ],
          },
        ],
        ms: [
          {
            category: 'Pilihan Istimewa',
            items: [
              {
                name: 'Hidangan Istimewa Chef',
                description: 'Hidangan kegemaran rumah yang disediakan segar setiap hari.',
                price: 'RM18',
                popular: true,
              },
              {
                name: 'Pinggan Perkongsian Hujung Minggu',
                description: 'Sesuai untuk kumpulan kecil dengan rasa tempatan klasik.',
                price: 'RM28',
              },
            ],
          },
        ],
        'zh-CN': [
          {
            category: '招牌推荐',
            items: [
              {
                name: '主厨精选',
                description: '每天新鲜准备的人气招牌菜。',
                price: 'RM18',
                popular: true,
              },
              {
                name: '周末分享拼盘',
                description: '适合多人共享，集合经典本地风味。',
                price: 'RM28',
              },
            ],
          },
        ],
        'zh-TW': [
          {
            category: '招牌推薦',
            items: [
              {
                name: '主廚精選',
                description: '每天新鮮準備的人氣招牌菜。',
                price: 'RM18',
                popular: true,
              },
              {
                name: '週末分享拼盤',
                description: '適合多人共享，集合經典在地風味。',
                price: 'RM28',
              },
            ],
          },
        ],
      },
      reviewTemplates: {
        en: [
          'Friendly team, quick service, and dishes that feel reliably home-style.',
          'A great local spot for casual meals and family gatherings.',
          'The menu is approachable and the flavours stay consistent.',
        ],
        ms: [
          'Pasukan mesra, servis pantas, dan rasa yang sentiasa meyakinkan.',
          'Tempat tempatan yang selesa untuk makan santai dan keluarga.',
          'Menunya mudah dinikmati dan rasanya konsisten.',
        ],
        'zh-CN': [
          '服务亲切，上菜也快，味道很有家常感。',
          '适合轻松用餐和家庭聚会的本地餐厅。',
          '菜单容易选择，出品也稳定。',
        ],
        'zh-TW': [
          '服務親切、上菜也快，味道很有家常感。',
          '適合輕鬆用餐和家庭聚會的在地餐廳。',
          '菜單容易選擇，出品也穩定。',
        ],
      },
    },
    beauty: {
      taglines: [
        {
          en: 'Relaxed appointments, thoughtful care, and polished results.',
          ms: 'Temujanji santai, penjagaan teliti, dan hasil yang kemas.',
          'zh-CN': '轻松预约、细致护理、稳定出色的效果。',
          'zh-TW': '輕鬆預約、細緻護理、穩定出色的效果。',
        },
      ],
      cta: {
        en: 'Book Now',
        ms: 'Tempah Sekarang',
        'zh-CN': '立即预约',
        'zh-TW': '立即預約',
      },
      services: {
        en: [
          {
            category: 'Popular Services',
            items: [
              {
                name: 'Cut and Styling',
                description: 'A polished look tailored to your preferences and routine.',
                price: 'RM55',
                popular: true,
              },
              {
                name: 'Colour Refresh',
                description: 'Tone, gloss, or full refresh using salon-grade products.',
                price: 'From RM120',
              },
            ],
          },
        ],
        ms: [
          {
            category: 'Perkhidmatan Popular',
            items: [
              {
                name: 'Potong dan Gaya',
                description: 'Penampilan kemas yang disesuaikan dengan cita rasa anda.',
                price: 'RM55',
                popular: true,
              },
              {
                name: 'Segar Semula Warna',
                description: 'Tone, gloss, atau pembaharuan warna dengan produk salon.',
                price: 'Dari RM120',
              },
            ],
          },
        ],
        'zh-CN': [
          {
            category: '热门服务',
            items: [
              {
                name: '剪发与造型',
                description: '根据日常习惯与喜好定制更利落的造型。',
                price: 'RM55',
                popular: true,
              },
              {
                name: '染色焕新',
                description: '使用专业产品进行补色、提亮或整体染色。',
                price: 'RM120起',
              },
            ],
          },
        ],
        'zh-TW': [
          {
            category: '熱門服務',
            items: [
              {
                name: '剪髮與造型',
                description: '根據日常習慣與喜好打造更俐落的造型。',
                price: 'RM55',
                popular: true,
              },
              {
                name: '染色煥新',
                description: '使用專業產品進行補色、提亮或整體染髮。',
                price: 'RM120起',
              },
            ],
          },
        ],
      },
      reviewTemplates: {
        en: [
          'The visit felt calm and professional from start to finish.',
          'Clear consultation, tidy space, and results that matched the brief.',
          'A dependable salon when you want polished work without fuss.',
        ],
        ms: [
          'Pengalaman yang tenang dan profesional dari awal hingga akhir.',
          'Konsultasi jelas, ruang kemas, dan hasil ikut permintaan.',
          'Salon yang boleh diharap untuk hasil kemas tanpa drama.',
        ],
        'zh-CN': [
          '从接待到完成都很放松，也很专业。',
          '沟通清楚、环境整洁，成品符合预期。',
          '想要稳定、利落效果时很值得来。',
        ],
        'zh-TW': [
          '從接待到完成都很放鬆，也很專業。',
          '溝通清楚、環境整潔，成品符合預期。',
          '想要穩定、俐落效果時很值得來。',
        ],
      },
    },
    clinic: {
      taglines: [
        {
          en: 'Clear explanations, steady care, and a reassuring patient experience.',
          ms: 'Penerangan jelas, rawatan teliti, dan pengalaman pesakit yang meyakinkan.',
          'zh-CN': '说明清楚、护理稳妥，让患者更安心。',
          'zh-TW': '說明清楚、護理穩妥，讓患者更安心。',
        },
      ],
      cta: {
        en: 'Book Appointment',
        ms: 'Buat Temujanji',
        'zh-CN': '预约问诊',
        'zh-TW': '預約問診',
      },
      services: {
        en: [
          {
            category: 'Core Services',
            items: [
              {
                name: 'Consultation',
                description: 'Discuss symptoms, concerns, and the next recommended steps.',
                price: 'RM50',
                popular: true,
              },
              {
                name: 'Follow-up Care',
                description: 'Progress review with a practical treatment update.',
                price: 'RM80',
              },
            ],
          },
        ],
        ms: [
          {
            category: 'Perkhidmatan Utama',
            items: [
              {
                name: 'Konsultasi',
                description: 'Bincang simptom, kebimbangan, dan langkah seterusnya.',
                price: 'RM50',
                popular: true,
              },
              {
                name: 'Rawatan Susulan',
                description: 'Semakan perkembangan dengan pelan rawatan yang dikemas kini.',
                price: 'RM80',
              },
            ],
          },
        ],
        'zh-CN': [
          {
            category: '核心服务',
            items: [
              {
                name: '问诊咨询',
                description: '沟通症状、顾虑与下一步建议。',
                price: 'RM50',
                popular: true,
              },
              {
                name: '复诊随访',
                description: '根据恢复进展调整更实际的治疗建议。',
                price: 'RM80',
              },
            ],
          },
        ],
        'zh-TW': [
          {
            category: '核心服務',
            items: [
              {
                name: '問診諮詢',
                description: '溝通症狀、顧慮與下一步建議。',
                price: 'RM50',
                popular: true,
              },
              {
                name: '複診追蹤',
                description: '根據恢復進展調整更實際的治療建議。',
                price: 'RM80',
              },
            ],
          },
        ],
      },
      reviewTemplates: {
        en: [
          'Staff communication was clear, calm, and easy to follow.',
          'The process felt organized and the team handled questions well.',
          'A dependable clinic experience when you need practical guidance.',
        ],
        ms: [
          'Komunikasi staf jelas, tenang, dan mudah difahami.',
          'Proses teratur dan pasukan menjawab soalan dengan baik.',
          'Pengalaman klinik yang boleh diharap bila perlukan panduan jelas.',
        ],
        'zh-CN': [
          '医护沟通清楚，也让人很安心。',
          '流程有条理，问题也能得到耐心解答。',
          '需要明确建议时，是一家可靠的诊所。',
        ],
        'zh-TW': [
          '醫護溝通清楚，也讓人很安心。',
          '流程有條理，問題也能得到耐心解答。',
          '需要明確建議時，是一家可靠的診所。',
        ],
      },
    },
    generic: {
      taglines: [
        {
          en: 'Trusted local service with practical help and clear next steps.',
          ms: 'Perkhidmatan tempatan yang dipercayai dengan bantuan yang praktikal.',
          'zh-CN': '值得信赖的本地服务，提供清楚而务实的帮助。',
          'zh-TW': '值得信賴的在地服務，提供清楚而務實的協助。',
        },
      ],
      cta: {
        en: 'Contact Us',
        ms: 'Hubungi Kami',
        'zh-CN': '联系我们',
        'zh-TW': '聯絡我們',
      },
      services: {
        en: [
          {
            category: 'What We Help With',
            items: [
              {
                name: 'Core Service',
                description: 'Straightforward support for the most common customer needs.',
                price: 'Ask for quote',
                popular: true,
              },
              {
                name: 'On-site Assistance',
                description: 'Practical help tailored to the job scope and timeline.',
                price: 'Custom',
              },
            ],
          },
        ],
        ms: [
          {
            category: 'Apa Yang Kami Bantu',
            items: [
              {
                name: 'Perkhidmatan Utama',
                description: 'Bantuan terus untuk keperluan pelanggan yang paling biasa.',
                price: 'Minta sebut harga',
                popular: true,
              },
              {
                name: 'Bantuan Di Lokasi',
                description: 'Bantuan praktikal mengikut skop kerja dan tempoh masa.',
                price: 'Tersuai',
              },
            ],
          },
        ],
        'zh-CN': [
          {
            category: '服务内容',
            items: [
              {
                name: '核心服务',
                description: '面向常见需求提供直接、务实的支持。',
                price: '欢迎询价',
                popular: true,
              },
              {
                name: '现场协助',
                description: '根据项目范围与时程提供更贴合的处理方式。',
                price: '定制',
              },
            ],
          },
        ],
        'zh-TW': [
          {
            category: '服務內容',
            items: [
              {
                name: '核心服務',
                description: '面向常見需求提供直接、務實的支援。',
                price: '歡迎詢價',
                popular: true,
              },
              {
                name: '到場協助',
                description: '根據項目範圍與時程提供更貼合的處理方式。',
                price: '客製',
              },
            ],
          },
        ],
      },
      reviewTemplates: {
        en: [
          'Quick replies, practical advice, and a team that keeps things moving.',
          'Helpful communication and a process that feels easy to follow.',
          'Reliable local service when you want clarity and momentum.',
        ],
        ms: [
          'Balasan cepat, nasihat praktikal, dan pasukan yang cekap.',
          'Komunikasi membantu dan proses yang mudah diikuti.',
          'Perkhidmatan tempatan yang boleh diharap bila mahukan kejelasan.',
        ],
        'zh-CN': [
          '回复快，建议务实，整个过程推进得很顺。',
          '沟通清晰，处理流程也容易跟进。',
          '需要明确、高效的本地服务时很可靠。',
        ],
        'zh-TW': [
          '回覆快，建議務實，整個流程推進得很順。',
          '溝通清晰，處理流程也容易跟進。',
          '需要明確、高效的在地服務時很可靠。',
        ],
      },
    },
  },
  reviewAuthors: ['Sarah L.', 'Ahmad R.', 'Wei Ming T.', 'Priya S.', 'Aisha M.', 'Jason C.'],
};
