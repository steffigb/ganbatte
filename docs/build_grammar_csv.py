# -*- coding: utf-8 -*-
import csv

UP = '/mnt/user-data/uploads/'
OUT = '/mnt/user-data/outputs/'

# ---------------------------------------------------------------------------
# Load existing vocabulary / kanji lists for cross-referencing
# ---------------------------------------------------------------------------

def load_col(path, col):
    with open(path, newline='', encoding='utf-8') as f:
        return [row[col].strip() for row in csv.DictReader(f) if row[col].strip()]

n5_vocab_raw = load_col(UP + 'jlpt-n5-vocabulary.csv', 'japanese')
n4_vocab_raw = load_col(UP + 'jlpt-n4-vocabulary.csv', 'japanese')
n5_kanji_raw = load_col(UP + 'jlpt-n5-kanji.csv', 'japanese')
n4_kanji_raw = load_col(UP + 'jlpt-n4-kanji.csv', 'japanese')


def clean_vocab(words):
    cleaned = set()
    for w in words:
        w2 = w.replace('～', '').replace('〜', '').strip()
        if len(w2) >= 2:
            cleaned.add(w2)
    return sorted(cleaned, key=len, reverse=True)


n5_vocab_pool = clean_vocab(n5_vocab_raw)
n4_vocab_pool = clean_vocab(n4_vocab_raw)
n5n4_vocab_pool = clean_vocab(n5_vocab_raw + n4_vocab_raw)

n5_kanji_set = set(n5_kanji_raw)
n4_kanji_set = set(n4_kanji_raw)
n5n4_kanji_set = n5_kanji_set | n4_kanji_set


def find_vocab(text, pool):
    found = []
    for w in pool:
        if w in text and w not in found:
            found.append(w)
    return found


def find_kanji(text, pool):
    found = []
    for ch in text:
        if ch in pool and ch not in found:
            found.append(ch)
    return found


# ---------------------------------------------------------------------------
# N5 grammar data
# Tuple format: (topics, pattern, meaning, formation, example, example_reading, example_meaning, notes)
# ---------------------------------------------------------------------------

N5 = [
("particles","は","Marks the topic of the sentence","Noun + は","私は学生です。","わたしはがくせいです。","I am a student.","Pronounced \"wa\", not \"ha\", when used as this particle."),
("particles","が","Marks the subject, especially new information; also used with 好き/欲しい/わかる/できる","Noun + が","猫がいます。","ねこがいます。","There is a cat.","Contrasts with は by highlighting the subject itself."),
("particles","を","Marks the direct object of a transitive verb","Noun + を","パンを食べます。","ぱんをたべます。","I eat bread.","Pronounced \"o\", not \"wo\", in modern speech."),
("particles","に（時間）","Marks a specific point in time","Time noun + に","七時に起きます。","しちじにおきます。","I get up at seven o'clock.","Not used with relative time words like 今日/明日."),
("particles","に（行き先）","Marks the destination of movement","Place + に","学校に行きます。","がっこうにいきます。","I go to school.","Interchangeable with へ for destinations."),
("particles","へ","Marks the direction of movement","Place + へ","日本へ行きます。","にほんへいきます。","I am going to Japan.","Pronounced \"e\", not \"he\", when used as this particle."),
("particles","で（場所）","Marks where an action takes place","Place + で","図書館で勉強します。","としょかんでべんきょうします。","I study at the library.","Contrast with に, which marks the location of existence."),
("particles","で（手段）","Marks the means, tool, or material used","Noun + で","バスで行きます。","ばすでいきます。","I go by bus.","Also used for materials: 紙で作ります (I make it out of paper)."),
("particles","と（一緒に）","Marks a companion for an action","Person + と","友達と話します。","ともだちとはなします。","I talk with my friend.","Requires a person or animate companion, not a tool."),
("particles","と（〜と〜）","Connects nouns into a complete, exhaustive list","Noun + と + Noun","パンと卵を買いました。","ぱんとたまごをかいました。","I bought bread and eggs.","Lists everything; compare や for partial lists."),
("particles","も","\"Also, too\"; replaces は, が, or を","Noun + も","私も学生です。","わたしもがくせいです。","I am also a student.","Can be repeated: AもBも (both A and B)."),
("particles","から（起点）","Marks a starting point in time or space","Noun + から","九時から始まります。","くじからはじまります。","It starts from nine o'clock.","Often paired with まで."),
("particles","まで","Marks an ending point in time or space","Noun + まで","五時まで働きます。","ごじまではたらきます。","I work until five o'clock.","Often paired with から."),
("particles","の（所有）","Connects two nouns, showing possession or description","Noun + の + Noun","これは私の本です。","これはわたしのほんです。","This is my book.","Also links nationality/profession + noun: 日本の車。"),
("particles","の（の代用）","Turns a preceding modifier into \"the one that...\"","な-Adj/い-Adj + の","赤いのをください。","あかいのをください。","Please give me the red one.","Avoids repeating the noun already mentioned."),
("particles","か","Turns a statement into a question","Sentence + か","学生ですか。","がくせいですか。","Are you a student?","The question mark is usually omitted in writing."),
("particles","や","\"And\" for a partial, non-exhaustive list","Noun + や + Noun","机の上に本やペンがあります。","つくえのうえにほんやぺんがあります。","There are things like books and pens on the desk.","Implies other items are also present."),
("particles","だけ","\"Only\"","Noun + だけ","一つだけください。","ひとつだけください。","Please give me just one.","Neutral in tone, unlike しか."),
("particles","しか〜ない","\"Only\" (emphasizes a limitation)","Noun + しか + negative verb","千円しかありません。","せんえんしかありません。","I have only 1000 yen.","Always paired with a negative verb."),
("particles","ね","Sentence-final particle seeking agreement","Sentence + ね","いい天気ですね。","いいてんきですね。","Nice weather, isn't it?","Softens statements and invites a response."),
("particles","よ","Sentence-final particle asserting new information","Sentence + よ","明日は休みですよ。","あしたはやすみですよ。","Tomorrow is a day off, you know.","Can sound pushy if overused with strangers."),
("copula","〜です","Polite copula: \"is/am/are\"","Noun/な-Adj + です","あれは山です。","あれはやまです。","That is a mountain.","The plain equivalent is だ."),
("copula","〜じゃありません","Polite negative copula","Noun/な-Adj + じゃありません","先生じゃありません。","せんせいじゃありません。","I am not a teacher.","ではありません is more formal/written."),
("copula","〜でした","Polite past copula","Noun/な-Adj + でした","昨日は雨でした。","きのうはあめでした。","It was rainy yesterday.","Negative past is 〜じゃありませんでした。"),
("copula","〜じゃありませんでした","Polite past negative copula","Noun/な-Adj + じゃありませんでした","休みじゃありませんでした。","やすみじゃありませんでした。","It was not a day off.","Longer, but very common in speech."),
("adjectives","い形容詞（現在）","Predicate use of an い-adjective","い-Adj (ends in い)","この本は面白いです。","このほんはおもしろいです。","This book is interesting.","です here just adds politeness, not tense."),
("adjectives","い形容詞（否定）","Negate an い-adjective","い-Adj stem + くない(です)","この本は面白くないです。","このほんはおもしろくないです。","This book is not interesting.","いい becomes よくない, an irregular change."),
("adjectives","い形容詞（過去）","Past tense of an い-adjective","い-Adj stem + かった(です)","映画は面白かったです。","えいがはおもしろかったです。","The movie was interesting.","いい becomes よかった。"),
("adjectives","い形容詞（過去否定）","Past negative of an い-adjective","い-Adj stem + くなかった(です)","テストは難しくなかったです。","てすとはむずかしくなかったです。","The test was not difficult.","Combines the negative and past rules."),
("adjectives","な形容詞（活用）","Conjugate a な-adjective like a noun","な-Adj + だ/です/じゃない/だった","ここは静かです。","ここはしずかです。","It is quiet here.","No な appears before です, only before a noun."),
("adjectives","な形容詞＋名詞","Modify a noun with a な-adjective","な-Adj + な + Noun","静かな町です。","しずかなまちです。","It is a quiet town.","The な is dropped in the predicate form."),
("adjectives","い形容詞＋名詞","Modify a noun with an い-adjective","い-Adj + Noun","面白い映画を見ました。","おもしろいえいがをみました。","I watched an interesting movie.","No linking word is needed between an い-adjective and a noun."),
("verb-forms","〜ます","Polite present/future affirmative","Verb stem + ます","毎日勉強します。","まいにちべんきょうします。","I study every day.","Also expresses future or habitual action."),
("verb-forms","〜ません","Polite present/future negative","Verb stem + ません","お酒を飲みません。","おさけをのみません。","I don't drink alcohol.","The negative counterpart of ます。"),
("verb-forms","〜ました","Polite past affirmative","Verb stem + ました","昨日勉強しました。","きのうべんきょうしました。","I studied yesterday.","The past form of ます。"),
("verb-forms","〜ませんでした","Polite past negative","Verb stem + ませんでした","昨日は行きませんでした。","きのうはいきませんでした。","I did not go yesterday.","The past negative form of ます。"),
("verb-forms","辞書形","Plain/dictionary form, used before certain grammar and in casual speech","Verb base form","毎日走る。","まいにちはしる。","I run every day.","Also the form found in dictionaries."),
("verb-forms","ない形","Plain negative form","Verb stem + ない","お酒を飲まない。","おさけをのまない。","I don't drink alcohol.","Base for many N4 patterns like 〜なければ。"),
("verb-forms","た形","Plain past form","Verb stem + た","映画を見た。","えいがをみた。","I watched a movie.","Follows the same sound changes as て形。"),
("verb-forms","て形","Connective form linking clauses or actions","Verb stem + て (with sound changes)","朝起きて、顔を洗います。","あさおきて、かおをあらいます。","I wake up in the morning and wash my face.","Base for many patterns: てください、ています, etc."),
("verb-forms","〜ましょう","Volitional: \"let's do\"","Verb stem + ましょう","一緒に行きましょう。","いっしょにいきましょう。","Let's go together.","Suggests an action to be done together."),
("verb-forms","〜ましょうか","\"Shall I/we...?\"","Verb stem + ましょうか","窓を開けましょうか。","まどをあけましょうか。","Shall I open the window?","Offers to do something for the listener."),
("verb-forms","〜ませんか","\"Won't you...?\" invitation","Verb stem + ませんか","一緒に映画を見ませんか。","いっしょにえいがをみませんか。","Won't you watch a movie with me?","Softer and more polite than ましょう。"),
("ability","〜ことができます","Expresses ability, \"can do\"","Verb (dictionary form) + ことができます","漢字を読むことができます。","かんじをよむことができます。","I can read kanji.","More formal than the potential verb form."),
("verb-forms","〜ています（進行）","Describes an action in progress","Verb て form + います","今、本を読んでいます。","いま、ほんをよんでいます。","I am reading a book now.","Also used for repeated habitual actions."),
("verb-forms","〜ています（状態）","Describes a resulting state after a change","Verb て form + います","結婚しています。","けっこんしています。","I am married.","Common with verbs like 知る、住む、持つ。"),
("requests-permission","〜てもいいです(か)","Asks for or gives permission","Verb て form + もいいです(か)","ここで写真を撮ってもいいですか。","ここでしゃしんをとってもいいですか。","May I take a photo here?","Answer with はい、いいですよ or いいえ、だめです。"),
("requests-permission","〜てください","Polite request: \"please do\"","Verb て form + ください","ここに名前を書いてください。","ここになまえをかいてください。","Please write your name here.","Softer than a plain command form."),
("requests-permission","〜てはいけません","Prohibition: \"must not\"","Verb て form + はいけません","ここで写真を撮ってはいけません。","ここでしゃしんをとってはいけません。","You must not take photos here.","Stronger than ないほうがいいです。"),
("requests-permission","〜ないでください","\"Please don't do\"","Verb ない form + でください","ここに駐車しないでください。","ここにちゅうしゃしないでください。","Please don't park here.","Common on signs and instructions."),
("requests-permission","〜てくださいませんか","Very polite request: \"could you possibly...\"","Verb て form + くださいませんか","窓を開けてくださいませんか。","まどをあけてくださいませんか。","Could you please open the window?","More formal/humble than てください。"),
("desire","〜たいです","Expresses the speaker's own desire to do something","Verb stem + たいです","日本へ行きたいです。","にほんへいきたいです。","I want to go to Japan.","Not usually used to describe others' desires directly; use たがっている。"),
("desire","〜がほしいです","Expresses desire for a thing","Noun + がほしいです","新しい靴がほしいです。","あたらしいくつがほしいです。","I want new shoes.","が, not を, marks the desired object."),
("existence","あります","Existence of inanimate objects","Noun + があります","机の上に本があります。","つくえのうえにほんがあります。","There is a book on the desk.","Also used for events: パーティーがあります。"),
("existence","います","Existence of animate beings","Noun + がいます","部屋に猫がいます。","へやにねこがいます。","There is a cat in the room.","Used for people and animals, not objects."),
("demonstratives","これ・それ・あれ・どれ","Pronouns for \"this/that/that over there/which one\"","Stand-alone pronoun","それは私のかばんです。","それはわたしのかばんです。","That is my bag.","それ = near the listener, あれ = far from both speakers."),
("demonstratives","この・その・あの・どの","Demonstrative adjectives before a noun","この/その/あの/どの + Noun","この本は面白いです。","このほんはおもしろいです。","This book is interesting.","Always followed directly by a noun."),
("demonstratives","ここ・そこ・あそこ・どこ","Pronouns for places: \"here/there/over there/where\"","Stand-alone pronoun","ここは私の学校です。","ここはわたしのがっこうです。","This is my school.","Same near/far pattern as これ・それ・あれ。"),
("demonstratives","こちら・そちら・あちら・どちら","Polite versions of directions/people","Stand-alone pronoun","こちらは田中さんです。","こちらはたなかさんです。","This is Mr. Tanaka.","Also used politely to mean \"which one\" (choice)."),
("question-words","何（なに/なん）","\"What\"","Question word","これは何ですか。","これはなんですか。","What is this?","Read なん before です/だ and before some counters."),
("question-words","誰（だれ）","\"Who\"","Question word","あの人は誰ですか。","あのひとはだれですか。","Who is that person?","どなた is the more polite equivalent."),
("question-words","いつ","\"When\"","Question word","誕生日はいつですか。","たんじょうびはいつですか。","When is your birthday?","Answers can be a date, day, or time expression."),
("question-words","どこ","\"Where\"","Question word","トイレはどこですか。","といれはどこですか。","Where is the restroom?","Part of the こそあど series."),
("question-words","どう・いかが","\"How\" (asking for an opinion or manner)","Question word","味はどうですか。","あじはどうですか。","How does it taste?","いかが is the more polite form."),
("question-words","いくつ","\"How many\" (counting; also asks age casually)","Question word","りんごはいくつありますか。","りんごはいくつありますか。","How many apples are there?","Also used to politely ask a child's age."),
("question-words","いくら","\"How much\" (price)","Question word","これはいくらですか。","これはいくらですか。","How much is this?","Only for prices, not general quantity."),
("question-words","なぜ・どうして","\"Why\"","Question word","どうして遅れましたか。","どうしておくれましたか。","Why were you late?","なぜ is slightly more formal/written."),
("numbers-counters","数字","Basic numbers 1–10 and beyond (native and Sino-Japanese)","Numeral","りんごを三つ買いました。","りんごをみっつかいました。","I bought three apples.","Two number systems exist; the counter decides which to use."),
("numbers-counters","〜つ","Native Japanese counter for general objects (1–10)","Number (native) + つ","りんごが五つあります。","りんごがいつつあります。","There are five apples.","Only goes up to とお (ten); use Sino-Japanese numbers after that."),
("numbers-counters","〜人","Counter for people","Number + 人","家族は四人です。","かぞくはよにんです。","There are four people in my family.","一人/二人 have irregular readings (ひとり/ふたり)。"),
("numbers-counters","〜時・〜時間","Clock time and duration","Number + 時 (o'clock) / 時間 (duration)","三時間勉強しました。","さんじかんべんきょうしました。","I studied for three hours.","時 = point in time, 時間 = length of time."),
("numbers-counters","〜月〜日","Months and dates","Number + 月 / 日","五月三日は休みです。","ごがつみっかはやすみです。","May 3rd is a holiday.","Many day readings (ついたち、ふつか...) are irregular."),
("numbers-counters","〜歳・〜才","Counter for age","Number + 歳/才","二十歳になりました。","はたちになりました。","I turned twenty.","二十歳 has the special reading はたち。"),
("connectors","そして","\"And then\" (connects two sentences)","Sentence。+ そして、Sentence。","宿題をしました。そして、寝ました。","しゅくだいをしました。そして、ねました。","I did my homework. And then, I slept.","Connects full sentences, not just words."),
("connectors","でも","\"But\" (sentence-initial contrast)","Sentence。+ でも、Sentence。","忙しいです。でも、楽しいです。","いそがしいです。でも、たのしいです。","I'm busy. But it's fun.","Casual; しかし is more formal."),
("connectors","〜から（理由）","\"Because\" (states a reason, clause-final)","Reason + から、Result","疲れたから、休みます。","つかれたから、やすみます。","Because I'm tired, I'll rest.","The reason comes first, the result second."),
("connectors","〜が（逆接）","\"But\" connecting two clauses","Clause + が、Clause","この店は安いですが、おいしくないです。","このみせはやすいですが、おいしくないです。","This shop is cheap, but it's not tasty.","Softer and more common in speech than でも。"),
("connectors","それから","\"After that, and then\"","Sentence。+ それから、Sentence。","朝ご飯を食べました。それから、学校へ行きました。","あさごはんをたべました。それから、がっこうへいきました。","I ate breakfast. After that, I went to school.","Emphasizes sequence more than そして。"),
("adverbs","とても・あまり","\"Very\" / \"not very\" (with negative)","とても + Adj / あまり + Adj + ない","今日はあまり暑くないです。","きょうはあまりあつくないです。","Today is not very hot.","あまり must be paired with a negative verb/adjective."),
("adverbs","よく・たくさん","\"Often / well\" / \"a lot, many\"","よく/たくさん + Verb","野菜をたくさん食べます。","やさいをたくさんたべます。","I eat a lot of vegetables.","よく can mean both \"often\" and \"well,\" depending on context."),
("adverbs","もう・まだ","\"Already\" / \"not yet, still\"","もう/まだ + Verb (past or negative)","もう宿題をしました。","もうしゅくだいをしました。","I already did my homework.","まだ pairs with a negative for \"not yet\": まだしていません。"),
]

# ---------------------------------------------------------------------------
# N4 grammar data
# ---------------------------------------------------------------------------

N4 = [
("te-form-extensions","〜てから","\"After doing\" (sequence, emphasizes completion first)","Verb て form + から","宿題をしてから、テレビを見ます。","しゅくだいをしてから、てれびをみます。","After doing my homework, I watch TV.","Emphasizes that the first action must finish before the next."),
("te-form-extensions","〜前に","\"Before doing\"","Verb (dictionary form) + 前に","寝る前に、歯を磨きます。","ねるまえに、はをみがきます。","Before sleeping, I brush my teeth.","The verb stays in dictionary form even for past events."),
("te-form-extensions","〜間に","\"While, during\" (a one-time event happens within a period)","Verb (ている/dictionary) + 間に","母が寝ている間に、料理をしました。","ははがねているあいだに、りょうりをしました。","While my mother was sleeping, I cooked.","Marks a single event happening within a period."),
("te-form-extensions","〜間","\"While\" (both actions last the whole period)","Verb (ている) + 間","母が寝ている間、テレビを見ました。","ははがねているあいだ、てれびをみました。","While my mother was sleeping, I watched TV the whole time.","Contrast with 間に, which marks a single event."),
("te-form-extensions","〜てしまう","Completion, often with a nuance of regret","Verb て form + しまう","宿題を忘れてしまいました。","しゅくだいをわすれてしまいました。","I ended up forgetting my homework.","Casual contraction: 〜ちゃう／〜じゃう。"),
("te-form-extensions","〜ておく","Do something in advance / leave something as is","Verb て form + おく","飲み物を買っておきます。","のみものをかっておきます。","I'll buy drinks in advance.","Casual contraction: 〜とく。"),
("te-form-extensions","〜てみる","\"Try doing\"","Verb て form + みる","この料理を食べてみます。","このりょうりをたべてみます。","I'll try eating this dish.","Implies trying something for the first time."),
("te-form-extensions","〜てくる","Change occurring over time, moving toward the speaker/now","Verb て form + くる","雨が降ってきました。","あめがふってきました。","It has started raining.","Also used literally: \"do and come back.\""),
("te-form-extensions","〜ていく","Change occurring over time, moving away from the speaker/now","Verb て form + いく","これから寒くなっていきます。","これからさむくなっていきます。","It's going to get colder from now on.","Also used literally: \"do and go.\""),
("te-form-extensions","〜ながら","\"While doing\" (two simultaneous actions by the same person)","Verb stem + ながら","音楽を聞きながら勉強します。","おんがくをききながらべんきょうします。","I study while listening to music.","The main action is the second verb."),
("giving-receiving","あげる","\"Give\" (speaker/in-group gives to someone else)","Noun + をあげる","友達にプレゼントをあげました。","ともだちにぷれぜんとをあげました。","I gave my friend a present.","Not used when the receiver is the speaker."),
("giving-receiving","くれる","\"Give\" (someone gives to the speaker/in-group)","Noun + をくれる","友達が私にプレゼントをくれました。","ともだちがわたしにぷれぜんとをくれました。","My friend gave me a present.","The giver's perspective is reversed compared to あげる。"),
("giving-receiving","もらう","\"Receive\"","Noun + をもらう","友達にプレゼントをもらいました。","ともだちにぷれぜんとをもらいました。","I received a present from my friend.","The giver is marked with に or から。"),
("giving-receiving","〜てあげる・てくれる・てもらう","Benefactive forms: doing an action as a favor","Verb て form + あげる/くれる/もらう","友達が手伝ってくれました。","ともだちがてつだってくれました。","My friend helped me (as a favor).","The direction of the favor follows the same logic as あげる/くれる/もらう。"),
("conditionals","〜と","\"When/if\" (natural, automatic consequence)","Verb/Adj (plain) + と","春になると、暖かくなります。","はるになると、あたたかくなります。","When spring comes, it gets warm.","Cannot be followed by a volitional or command in the result clause."),
("conditionals","〜ば","\"If\" (general hypothetical condition)","Verb/Adj ば form","お金があれば、旅行します。","おかねがあれば、りょこうします。","If I have money, I'll travel.","Often used for general truths and proverbs."),
("conditionals","〜たら","\"If/when\" (general, common in speech)","Verb/Adj た form + ら","雨が降ったら、行きません。","あめがふったら、いきません。","If it rains, I won't go.","The most flexible and commonly used conditional."),
("conditionals","〜なら","\"If it's the case that\" (responds to a topic already mentioned)","Noun/Verb (plain) + なら","日本に行くなら、京都がおすすめです。","にほんにいくなら、きょうとがおすすめです。","If you're going to Japan, I recommend Kyoto.","Comments on the premise itself, not a future event."),
("conditionals","〜ても","\"Even if\"","Verb て form + も","雨が降っても、行きます。","あめがふっても、いきます。","Even if it rains, I'll go.","Negative counterpart: 〜なくても (even if not)。"),
("verb-forms","可能形","Potential form, \"can do\" (built into the verb itself)","Godan: e-stem+る／Ichidan: stem+られる／する→できる／来る→来られる","漢字が読めます。","かんじがよめます。","I can read kanji.","More natural in speech than ことができます。"),
("passive","受身形","Passive voice","Godan: a-stem+れる／Ichidan: stem+られる／する→される／来る→来られる","先生に褒められました。","せんせいにほめられました。","I was praised by the teacher.","Also expresses being negatively affected: 財布を盗まれました。"),
("causative","使役形","Causative, \"make/let someone do\"","Godan: a-stem+せる／Ichidan: stem+させる／する→させる／来る→来させる","子供に野菜を食べさせます。","こどもにやさいをたべさせます。","I make my child eat vegetables.","Can mean either \"force\" or \"let,\" depending on context."),
("causative","使役受身形","Causative-passive, \"be made to do\"","Godan: a-stem+せられる(される)／Ichidan: stem+させられる","宿題をさせられました。","しゅくだいをさせられました。","I was made to do homework.","Godan verbs often contract せられる to される。"),
("honorific","尊敬語（基本動詞）","Basic respectful verbs for someone else's actions","Special verb forms (いらっしゃる、召し上がる, etc.)","先生はもう帰られました。","せんせいはもうかえられました。","The teacher has already gone home.","Special verbs exist for common actions like 行く/来る/食べる。"),
("honorific","謙譲語（基本動詞）","Basic humble verbs for the speaker's own actions","Special verb forms (いたす、申す, etc.)","私が荷物をお持ちいたします。","わたしがにもつをおもちいたします。","I will carry the luggage (humbly).","Lowers the speaker to show respect toward the listener."),
("conjecture","〜そうです（伝聞）","Hearsay: \"I heard that...\"","Verb/Adj (plain) + そうです","天気予報によると、明日は雨だそうです。","てんきよほうによると、あしたはあめだそうです。","According to the weather forecast, it will rain tomorrow.","The source is often marked with によると。"),
("conjecture","〜そうです（様態）","Visual conjecture, \"looks like\"","Verb stem/Adj stem + そうです","このケーキはおいしそうです。","このけーきはおいしそうです。","This cake looks delicious.","いい becomes よさそう, an irregular change."),
("conjecture","〜ようです","Conjecture based on evidence, \"it seems\"","Verb/Adj (plain) + ようです","誰か来たようです。","だれかきたようです。","It seems someone has come.","A more subjective/personal impression than らしい。"),
("conjecture","〜らしいです","Hearsay/typical trait, \"apparently, typical of\"","Verb/Adj/Noun (plain) + らしいです","田中さんは来ないらしいです。","たなかさんはこないらしいです。","Apparently, Mr. Tanaka isn't coming.","Also means \"typical of,\" e.g., 男らしい (manly)。"),
("conjecture","〜でしょう","Probability, \"probably\"","Verb/Adj/Noun (plain) + でしょう","明日は晴れるでしょう。","あしたははれるでしょう。","It will probably be sunny tomorrow.","Rising intonation turns it into a soft question, \"right?\""),
("conjecture","〜かもしれません","Possibility, \"might, may\"","Verb/Adj/Noun (plain) + かもしれません","明日は雨かもしれません。","あしたはあめかもしれません。","It might rain tomorrow.","Weaker certainty than でしょう。"),
("conjecture","〜はずです","Expectation based on reason, \"should be\"","Verb/Adj/Noun (plain) + はずです","田中さんはもう着いているはずです。","たなかさんはもうついているはずです。","Mr. Tanaka should have already arrived.","Expresses strong logical expectation, not simple guessing."),
("obligation","〜なければなりません","\"Must do\"","Verb ない form (drop い) + ければなりません","明日、早く起きなければなりません。","あした、はやくおきなければなりません。","I must get up early tomorrow.","Casual contraction: 〜なきゃ。"),
("obligation","〜なくてもいいです","\"Don't have to do\"","Verb ない form (drop い) + くてもいいです","明日は行かなくてもいいです。","あしたはいかなくてもいいです。","I don't have to go tomorrow.","The opposite of なければなりません。"),
("obligation","〜たほうがいいです","\"Had better do\" (advice)","Verb た form + ほうがいいです","もっと野菜を食べたほうがいいです。","もっとやさいをたべたほうがいいです。","You'd better eat more vegetables.","Can sound direct; soften with かもしれません when unsure."),
("obligation","〜ないほうがいいです","\"Had better not do\" (advice)","Verb ない form + ほうがいいです","お酒を飲みすぎないほうがいいです。","おさけをのみすぎないほうがいいです。","You'd better not drink too much.","The negative counterpart of たほうがいいです。"),
("intention","〜つもりです","\"Intend to\" (personal plan)","Verb (dictionary form) + つもりです","来年、留学するつもりです。","らいねん、りゅうがくするつもりです。","I intend to study abroad next year.","Negative: 〜ないつもりです (\"intend not to\")。"),
("intention","〜予定です","\"Scheduled to\" (more formal/fixed plan)","Verb (dictionary form) + 予定です","来週、東京へ行く予定です。","らいしゅう、とうきょうへいくよていです。","I'm scheduled to go to Tokyo next week.","More formal and fixed than つもりです。"),
("intention","〜（よ）うと思います","\"I've decided I'll try to...\" (volitional + think)","Verb volitional form + と思います","来年、日本語を勉強しようと思います。","らいねん、にほんごをべんきょうしようとおもいます。","I'm thinking I'll study Japanese next year.","Softer and more tentative than つもりです。"),
("intention","〜ことにする","\"Decide to\" (speaker's own decision)","Verb (dictionary/ない form) + ことにする","毎日運動することにしました。","まいにちうんどうすることにしました。","I decided to exercise every day.","Emphasizes an active, personal decision."),
("intention","〜ことになる","\"It has been decided that...\" (external/circumstantial decision)","Verb (dictionary/ない form) + ことになる","来月、大阪に転勤することになりました。","らいげつ、おおさかにてんきんすることになりました。","It has been decided that I'll transfer to Osaka next month.","Implies the decision was made by others or circumstances."),
("change-of-state","〜くなる・になる","\"Become\" (change in an adjective or noun state)","い-Adj stem+くなる／な-Adj/Noun+になる","日本語が上手になりました。","にほんごがじょうずになりました。","I have become good at Japanese.","い-adjectives use く, な-adjectives/nouns use に。"),
("change-of-state","〜ようになる","\"Come to do\" (change in ability or habit)","Verb (dictionary/potential form) + ようになる","漢字が読めるようになりました。","かんじがよめるようになりました。","I have come to be able to read kanji.","Marks a gradual change over time, not a single event."),
("change-of-state","〜くする・にする","\"Make (something into)\"","い-Adj stem+くする／な-Adj/Noun+にする","部屋をきれいにしました。","へやをきれいにしました。","I made the room clean.","The causative counterpart of くなる/になる。"),
("experience","〜たことがあります","\"Have done (before)\", experience","Verb た form + ことがあります","富士山に登ったことがあります。","ふじさんにのぼったことがあります。","I have climbed Mt. Fuji before.","Negative 〜たことがありません means \"have never done.\""),
("experience","〜たり〜たりします","Lists representative actions among others","Verb た form + り (repeated) + します","週末は本を読んだり、映画を見たりします。","しゅうまつはほんをよんだり、えいがをみたりします。","On weekends, I do things like read books and watch movies.","Implies that other, unlisted activities also happen."),
("experience","〜ことがあります","\"Sometimes happens/do\"","Verb (dictionary form) + ことがあります","たまに寝坊することがあります。","たまにねぼうすることがあります。","I sometimes oversleep.","Different from たことがある (past experience) — this is about occasional occurrence."),
("extent-degree","〜すぎる","\"Too much\"","Verb stem/Adj stem + すぎる","食べすぎました。","たべすぎました。","I ate too much.","い-adjectives drop the final い before すぎる。"),
("extent-degree","〜やすい","\"Easy to do\"","Verb stem + やすい","この漢字は覚えやすいです。","このかんじはおぼえやすいです。","This kanji is easy to remember.","Conjugates like a normal い-adjective."),
("extent-degree","〜にくい","\"Hard to do\"","Verb stem + にくい","この漢字は書きにくいです。","このかんじはかきにくいです。","This kanji is hard to write.","The opposite of やすい, with the same conjugation pattern."),
("extent-degree","〜くらい・ほど","\"To the extent that\"","Noun/Clause + くらい/ほど","泣きたいくらい嬉しいです。","なきたいくらいうれしいです。","I'm so happy I could cry.","Also used for rough amounts: 一時間くらい。"),
("comparison","〜より〜のほうが","Comparative, \"more ~ than ~\"","A より B のほうが + Adj","電車よりバスのほうが安いです。","でんしゃよりばすのほうがやすいです。","The bus is cheaper than the train.","The favored/compared item comes right before のほうが。"),
("comparison","〜の中で一番","Superlative, \"the most ~ among ~\"","Group + の中で一番 + Adj","家族の中で父が一番背が高いです。","かぞくのなかでちちがいちばんせがたかいです。","Among my family, my father is the tallest.","一番 always comes directly before the adjective."),
("comparison","〜ほど〜ない","\"Not as ~ as ~\"","A は B ほど + Adj (negative)","今日は昨日ほど寒くないです。","きょうはきのうほどさむくないです。","Today is not as cold as yesterday.","Always paired with a negative predicate."),
("quotation","〜と言いました","Reported speech, \"said that...\"","Sentence (plain) + と言いました","田中さんは明日来ると言いました。","たなかさんはあしたくるといいました。","Mr. Tanaka said he would come tomorrow.","The quoted clause stays in plain form."),
("quotation","〜と思います","\"I think that...\"","Sentence (plain) + と思います","明日は雨だと思います。","あしたはあめだとおもいます。","I think it will rain tomorrow.","Softer and more common than a direct assertion."),
("quotation","〜という","\"Called, named\"","Noun + という + Noun","「げんき」という本を使っています。","「げんき」というほんをつかっています。","I'm using a book called \"Genki.\"","Useful for introducing unfamiliar names or terms."),
("purpose-reason","〜ために","\"In order to, for the purpose of\"","Verb (dictionary form)／Noun+の + ために","日本語を勉強するために、日本に来ました。","にほんごをべんきょうするために、にほんにきました。","I came to Japan in order to study Japanese.","The subject of both clauses is usually the same person."),
("purpose-reason","〜ので","\"Because\" (softer, more objective reason)","Plain form + ので","疲れたので、休みます。","つかれたので、やすみます。","Because I'm tired, I'll rest.","Sounds more polite/formal than から。"),
("purpose-reason","〜し","Lists reasons or qualities, \"and also\"","Plain form + し (often repeated)","この店は安いし、おいしいです。","このみせはやすいし、おいしいです。","This shop is cheap, and it's also delicious.","Implies there are even more reasons than stated."),
("purpose-reason","〜のに","\"Although, despite\" (unexpected/regrettable result)","Plain form + のに","頑張ったのに、失敗しました。","がんばったのに、しっぱいしました。","Despite trying hard, I failed.","Carries a nuance of surprise or disappointment."),
("purpose-reason","〜ように（目的）","\"So that\" (purpose, with non-volitional verbs)","Verb (potential/dictionary, non-volitional) + ように","忘れないように、メモします。","わすれないように、めもします。","I'll take notes so that I don't forget.","Used when the verb isn't under direct control, unlike ために。"),
("manner","〜方（かた）","\"How to do\", nominalized method","Verb stem + 方","この漢字の読み方が分かりません。","このかんじのよみかたがわかりません。","I don't know how to read this kanji.","Very productive: 使い方、作り方、行き方, etc."),
("manner","〜まま","\"As is,\" staying in the same state","Verb た form／Noun+の + まま","靴を履いたまま、部屋に入りました。","くつをはいたまま、へやにはいりました。","I entered the room with my shoes still on.","Emphasizes that a state continues unchanged."),
("verb-aspect","〜始める","\"Begin doing\"","Verb stem + 始める","雨が降り始めました。","あめがふりはじめました。","It has started to rain.","Focuses on the beginning point of an action."),
("verb-aspect","〜終わる","\"Finish doing\"","Verb stem + 終わる","宿題をし終わりました。","しゅくだいをしおわりました。","I finished doing my homework.","Focuses on the completion point of an action."),
("verb-aspect","〜続ける","\"Continue doing\"","Verb stem + 続ける","十年間、日本語を勉強し続けています。","じゅうねんかん、にほんごをべんきょうしつづけています。","I have continued studying Japanese for ten years.","Emphasizes ongoing duration."),
("verb-aspect","〜出す","\"Suddenly start doing\"","Verb stem + 出す","赤ちゃんが急に泣き出しました。","あかちゃんがきゅうになきだしました。","The baby suddenly started crying.","Implies a sudden, often unexpected, onset."),
("requests-advanced","〜てくれませんか","\"Won't you do (for me)?\" polite request","Verb て form + くれませんか","手伝ってくれませんか。","てつだってくれませんか。","Won't you help me?","More polite than plain てください。"),
("requests-advanced","〜ていただけませんか","\"Could you possibly do (for me)?\" very polite request","Verb て form + いただけませんか","もう一度説明していただけませんか。","もういちどせつめいしていただけませんか。","Could you possibly explain once more?","Very formal; common in business or with strangers."),
("requests-advanced","お＋動詞stem＋ください","Honorific request form","お + Verb stem + ください","どうぞお座りください。","どうぞおすわりください。","Please have a seat.","More formal than plain てください; common in service settings."),
("honorific","れる・られる（尊敬）","Respectful passive-form used to show respect for someone's action","Verb passive form","社長は何時に来られますか。","しゃちょうはなんじにこられますか。","What time will the president arrive?","Simpler but less formal than special honorific verbs."),
("honorific","お＋動詞stem＋になる","Honorific pattern for someone else's action","お + Verb stem + になる","先生は本をお読みになります。","せんせいはほんをおよみになります。","The teacher reads a book.","More formal than the れる/られる honorific."),
("honorific","〜させていただきます","Humble request-permission, \"allow me to do\"","Verb causative stem + ていただきます","今日は早く帰らせていただきます。","きょうははやくかえらせていただきます。","Please allow me to go home early today.","Very polite; common in workplace Japanese."),
("particles-advanced","〜について","\"About, concerning\"","Noun + について","日本の文化について話します。","にほんのぶんかについてはなします。","I'll talk about Japanese culture.","Often precedes verbs like 話す、書く、考える。"),
("particles-advanced","〜として","\"As, in the capacity of\"","Noun + として","彼は先生として働いています。","かれはせんせいとしてはたらいています。","He works as a teacher.","Marks a role or capacity, not identity."),
("particles-advanced","〜によって","\"Depending on\" / \"by means of\"","Noun + によって","人によって考え方が違います。","ひとによってかんがえかたがちがいます。","Ways of thinking differ depending on the person.","Also used for the agent in passive sentences: 〜によって作られた。"),
("particles-advanced","〜に対して","\"Towards, in contrast to\"","Noun + に対して","彼は子供に対して優しいです。","かれはこどもにたいしてやさしいです。","He is kind towards children.","Marks the target of an attitude or action."),
("particles-advanced","〜にとって","\"For (someone)\", from someone's perspective","Noun + にとって","私にとって家族が一番大切です。","わたしにとってかぞくがいちばんたいせつです。","For me, family is the most important.","Marks the standpoint from which a judgment is made."),
("particles-advanced","さえ","\"Even\" (emphasis, often an extreme example)","Noun + さえ","子供さえ分かります。","こどもさえわかります。","Even a child understands this.","Emphasizes that the given example is the least likely to qualify."),
("nominalization","こと","Nominalizer: turns a verb phrase into \"the act/fact of ~ing\"","Verb (plain form) + こと","私の趣味は本を読むことです。","わたしのしゅみはほんをよむことです。","My hobby is reading books.","Common after が好き／が得意／ができる。"),
("nominalization","〜さ","Turns an い-adjective into a noun, \"-ness\"","い-Adj stem + さ","この山の高さはどのくらいですか。","このやまのたかさはどのくらいですか。","How high is this mountain?","Makes the adjective measurable/quantifiable."),
("connectors-advanced","それで","\"So, therefore\" (result)","Sentence。+ それで、Sentence。","電車が遅れました。それで、遅刻しました。","でんしゃがおくれました。それで、ちこくしました。","The train was late. So, I was late.","States a cause-and-effect relationship between two sentences."),
("connectors-advanced","けれど（も）","\"Although, but\" (more formal than でも/が)","Clause + けれど（も）、Clause","頑張りましたけれども、負けました。","がんばりましたけれども、まけました。","I tried hard, but I lost.","Slightly more formal/literary than が。"),
("connectors-advanced","たとえ〜ても","\"Even if\" (emphatic concession)","たとえ + Verb て form + も","たとえ雨が降っても、行きます。","たとえあめがふっても、いきます。","Even if it rains, I'll go.","たとえ emphasizes the extremeness of the hypothetical."),
("connectors-advanced","それに","\"Moreover, in addition\"","Sentence。+ それに、Sentence。","この店は安いです。それに、おいしいです。","このみせはやすいです。それに、おいしいです。","This shop is cheap. Moreover, it's delicious.","Adds a supporting point rather than a contrast."),
("misc","〜てもかまいません","\"It's fine even if...\" (permission, slightly formal)","Verb て form + もかまいません","ここに座ってもかまいません。","ここにすわってもかまいません。","It's fine if you sit here.","A more formal alternative to てもいいです。"),
("misc","〜ずに","\"Without doing\" (formal equivalent of ないで)","Verb ない form (drop ない) + ずに","朝ご飯を食べずに、学校へ行きました。","あさごはんをたべずに、がっこうへいきました。","I went to school without eating breakfast.","する becomes せずに, an irregular change."),
("misc","〜たばかり","\"Just did\"","Verb た form + ばかり","さっき昼ご飯を食べたばかりです。","さっきひるごはんをたべたばかりです。","I just ate lunch a moment ago.","Emphasizes how recently the action was completed."),
("misc","〜たところ","\"Just did, at the point of finishing\"","Verb た form + ところ","ちょうど今、着いたところです。","ちょうどいま、ついたところです。","I've just arrived right now.","Similar to たばかり but focuses on the exact moment."),
("misc","〜るところ","\"About to do\"","Verb (dictionary form) + ところ","これから出かけるところです。","これからでかけるところです。","I'm just about to go out.","Marks a point right before an action begins."),
("misc","〜ているところ","\"In the middle of doing\"","Verb て form + いるところ","今、宿題をしているところです。","いま、しゅくだいをしているところです。","I'm in the middle of doing homework right now.","Emphasizes the action is ongoing at this exact moment."),
("misc","〜おかげで","\"Thanks to\" (positive cause)","Noun+の／Verb(plain) + おかげで","先生のおかげで、日本語が上手になりました。","せんせいのおかげで、にほんごがじょうずになりました。","Thanks to my teacher, I became good at Japanese.","Almost always used for a positive outcome."),
("misc","〜せいで","\"Because of\" (negative cause, blame)","Noun+の／Verb(plain) + せいで","雨のせいで、試合が中止になりました。","あめのせいで、しあいがちゅうしになりました。","Because of the rain, the game was cancelled.","Almost always used for a negative outcome; the opposite of おかげで。"),
("misc","〜わけではない","\"It's not the case that...\" (partial denial)","Plain form + わけではない","嫌いなわけではないですが、あまり食べません。","きらいなわけではないですが、あまりたべません。","It's not that I dislike it, but I don't eat it much.","Softly denies an assumption without a full negation."),
("misc","〜わけがない","\"There's no way that...\"","Plain form + わけがない","そんな話、本当なわけがない。","そんなはなし、ほんとうなわけがない。","There's no way that story is true.","Expresses strong conviction that something is impossible."),
("misc","〜に違いない","\"Must be\" (strong conviction)","Plain form + に違いない","あの人は先生に違いない。","あのひとはせんせいにちがいない。","That person must be a teacher.","Stronger and more confident than でしょう or はずだ。"),
("misc","〜がる","Shows outward signs of a third person's feelings/desires","い-Adj stem／ほしい・いや stem + がる","妹は新しいゲームをほしがっています。","いもうとはあたらしいげーむをほしがっています。","My younger sister wants the new game.","Used for others; たい/ほしい directly are for the speaker."),
("misc","〜てはどうですか","\"How about doing\" (suggestion)","Verb て form + はどうですか","一度病院に行ってはどうですか。","いちどびょういんにいってはどうですか。","How about going to the hospital once?","Slightly more formal suggestion than たらどうですか。"),
("misc","〜たらどうですか","\"What if you did\" (suggestion)","Verb た form + らどうですか","少し休んだらどうですか。","すこしやすんだらどうですか。","Why don't you rest a little?","A common, friendly way to give advice."),
]

# ---------------------------------------------------------------------------
# Longer-form usage explanations (parallel arrays, same order as N5 / N4 above)
# ---------------------------------------------------------------------------

N5_EXPLANATIONS = [
"は sets up what the rest of the sentence will be about; it doesn't necessarily mark the grammatical subject. Contrast with が, which introduces new information or highlights the subject itself. New learners often overuse は where が is needed, especially with question words (誰が来ますか, not 誰は).",
"が answers \"who/what\" questions and introduces new, previously unmentioned information, where は would sound off if the topic is already established. It's also required (not optional) with a fixed set of predicates: 好き, 嫌い, 欲しい, わかる, できる, あります/います — even though these look like objects in English, Japanese treats them as the grammatical subject.",
"を marks what receives the action of a transitive verb. A small set of motion verbs (歩く、走る、渡る、散歩する) also take を to mark the space passed through rather than a destination, e.g. 公園を歩きます (I walk through the park) — a common point of confusion with に/で.",
"に attaches to specific, countable points in time (clock times, dates, weekdays) but is dropped with relative time words like 今日、明日、今、毎日 — you say 月曜日に行きます but just 明日行きます, without に.",
"に and へ are interchangeable for destinations in casual speech, but に is also required for the \"point\" side of many other patterns (existence, giving/receiving, indirect objects), so it's worth mastering に first.",
"へ emphasizes the general direction of travel rather than the specific endpoint. In everyday speech, に and へ are largely interchangeable for destinations, so don't worry too much about picking the \"wrong\" one casually.",
"で marks where an action happens, while に marks where something exists or is located — compare 部屋で勉強します (I study in the room, action) with 部屋にいます (I am in the room, existence). Mixing these up is one of the most common N5 particle mistakes.",
"で also covers the tool, method, or material used to do something, extending beyond transportation to writing tools (ペンで書く), languages (日本語で話す), and payment methods (カードで払う).",
"と requires an animate companion who actively takes part in the action together with the speaker; for a tool or instrument, use で instead — 友達と話す (talk with a friend) vs 電話で話す (talk by phone).",
"と creates a complete, closed list — パンと卵を買いました implies bread and eggs were the only things bought. If other unlisted items might also be present, use や instead.",
"も replaces は、が、or を entirely (it never stacks with them) and can appear on multiple parts of a sentence to mean \"both... and...\": 兄も姉もいます (I have both an older brother and an older sister).",
"から marks a starting point for time, place, or motion, and is very commonly paired with まで to define a range (九時から五時まで). から can separately mean \"because\" at the end of a full clause — context tells the two uses apart.",
"まで marks an endpoint and, unlike から, cannot mean \"because.\" It's almost always learned as a pair with から to express a range.",
"の links any two nouns, not just for possession — it also connects nationality/origin + noun (日本の車), material + noun, and topic + noun, working much like English \"of\" in reverse order.",
"This の stands in for a noun already mentioned so you don't have to repeat it — if someone points at bags and asks どれがいいですか, you can answer 赤いのがいいです instead of repeating かばん.",
"か simply turns any statement into a question by attaching to the end; word order never changes. か can also connect two nouns to mean \"or\" (コーヒーか紅茶, coffee or tea).",
"や lists a few representative items while implying others aren't mentioned — 本やペンがあります suggests notebooks, erasers, etc. might also be there. This softness makes や natural for giving examples rather than a complete inventory.",
"だけ is neutral and simply states a limit (\"only this many/this much\") without extra emotional color, making it the safer default compared to しか, which always forces a negative verb and implies less than expected.",
"しか must be followed by a negative predicate even though the meaning is positive in English (\"only 1000 yen\" = 千円しかありません). It often implies the amount is less than hoped for, unlike the neutral だけ.",
"ね invites agreement or shared feeling and softens statements, making conversation feel collaborative — but overusing it with someone you don't know well, or in formal writing, can sound overly familiar.",
"よ asserts something the speaker believes the listener doesn't already know, so it's used to inform, warn, or correct. Using よ with information the listener obviously already knows can sound condescending.",
"です is the polite form of the copula だ, used after nouns and な-adjectives. Unlike English \"to be,\" it never conjugates for person or number, only for tense and politeness (です/だ, でした/だった).",
"じゃ is a contraction of では common in speech; ではありません is preferred in writing or formal contexts, while じゃありません and the even more casual じゃない are typical of everyday conversation.",
"でした is simply です shifted to the past; the tense sits on the copula itself, not on the noun or な-adjective in front of it, which stays unchanged.",
"This combines the negative and the past together; casual speech often shortens it to じゃなかった(です), worth recognizing even if not the focus here.",
"い-adjectives conjugate on their own, without needing です for grammatical correctness — 面白い is already a complete sentence; です only adds politeness, unlike with nouns/な-adjectives where だ/です carries real grammatical weight.",
"Drop the final い and add くない; the one irregular case to remember is いい (good), which becomes よくない, not いくない.",
"Drop the final い and add かった; いい again becomes よかった, following the same irregular pattern as the negative form.",
"Combine both rules: drop い, add くなかった. This four-way table (present/negative/past/past-negative) is the backbone for every い-adjective you'll ever learn.",
"な-adjectives behave grammatically like nouns — they take だ/です、じゃない、and だった exactly as a noun would, which is why they're sometimes called \"adjectival nouns.\"",
"The な only appears when directly modifying a following noun (静かな町); in the predicate position (町は静かです) the な disappears entirely — mixing these two forms up is a very common beginner error.",
"Unlike な-adjectives, い-adjectives attach directly to the following noun with no linking particle at all, in exactly the same form used in the predicate.",
"ます attaches to the pre-masu stem of the verb (食べ-ます、飲み-ます、し-ます) and is the default polite form for people you don't know well or formal contexts; casual speech uses the plain forms instead.",
"A simple negative swap of ます; the ません ending itself never changes form regardless of verb type.",
"Past tense sits on ます itself (ます→ました), leaving the verb stem untouched — this regularity is one reason polite forms are often taught before plain forms.",
"Combines negative and past; there's no casual contraction of this in polite speech, unlike the plain forms.",
"The dictionary form is also the plain/casual present tense used with friends and family, and it's the form found in dictionaries — it's the base for potential, volitional, and many later grammar patterns.",
"Formed differently by verb group (godan verbs shift to the a-stem, e.g. 飲む→飲まない; ichidan verbs drop る and add ない). Mastering this early pays off, since dozens of later patterns (なければ、ないで、なくてもいい) build on it.",
"た形 follows the exact same sound-change rules as て形 — once you know て形, た形 is essentially free, since you just swap て/で for た/だ.",
"Sound changes depend on the verb's final syllable (う/つ/る→って、ぬ/ぶ/む→んで、く→いて、ぐ→いで、す→して), plus irregulars for する→して and 来る→来て. Arguably the single most important form in Japanese, since permission, requests, and progressive tense all attach to it.",
"ましょう proposes a joint action and assumes the listener will likely agree, which is why it's often translated \"let's,\" rather than being a genuine question.",
"Adding か turns the proposal into an offer or question, checking whether the listener actually wants that action — 行きましょう (let's go, assumed agreement) vs 行きましょうか (shall we go? checking first).",
"Phrasing an invitation as a negative question (ませんか instead of ましょう) is considered more polite, since it leaves the listener room to decline without directly rejecting a proposal.",
"This nominalizes the verb (\"the act of doing X\") before stating it \"is possible\" — grammatically more roundabout than the direct potential form (食べられる), which is why native speakers favor the potential form in casual speech.",
"For an action currently unfolding, ています behaves like English \"-ing\": 今、電話で話しています (I am talking on the phone right now).",
"For a small set of change verbs (結婚する、住む、知る、持つ), ています instead describes the resulting ongoing state, not an action in progress — 結婚しています means \"I am married,\" not \"I am getting married.\"",
"Literally \"even if [I] do X, it's fine\" — asking permission this way is indirect and polite by nature. A blunt refusal (だめです) is common, but native speakers often soften a \"no\" with ちょっと... instead.",
"てください is polite but fairly direct — appropriate for teachers, service staff, or instructions, but with close friends it can feel unnecessarily formal, where a bare て-form request is more natural.",
"A strong, formal prohibition often seen on signs and rules; in casual speech, だめ or ちゃだめ softens the same meaning considerably.",
"Built on the plain negative (ない形) plus でください — note this base differs from てはいけません, which uses the plain affirmative て形. Mixing up which base each request pattern needs is a common error.",
"Turning the request into a negative question (くださいませんか instead of ください) adds a layer of humility, similar to how ませんか softens invitations — useful when asking a favor of someone senior to you.",
"たいです directly expresses the speaker's own first-person desire and behaves like an い-adjective (たかったです、たくないです). It sounds overly direct or even rude used about someone else's wishes, where たがっている is used instead.",
"が, not を, marks the desired object because ほしい is grammatically an い-adjective (\"desirable/wanted\"), not a verb. Like たい, it conjugates as an adjective and is typically reserved for the speaker's own wants.",
"あります covers all inanimate existence, including abstract events like meetings or parties (パーティーがあります), and is also used idiomatically for \"having\" something (お金があります), since Japanese doesn't distinguish \"there is\" from \"I have.\"",
"います is reserved strictly for animate beings (people, animals) — using あります for a person or pet is a common and noticeable beginner mistake.",
"These follow a consistent こ/そ/あ/ど pattern found across all demonstrative words: こ- near the speaker, そ- near the listener, あ- far from both, ど- the question form — a pattern worth memorizing once, since it recurs everywhere.",
"Unlike これ/それ/あれ/どれ, this set can never stand alone — it must always directly precede a noun, functioning purely as an adjective (\"this ~,\" not \"this\").",
"The same near/far logic applies to places as to things; あそこ specifically implies a place visible or known to both speakers, not just any distant place.",
"These are the polite register of the this/that series, commonly used to introduce people politely (こちらは田中さんです) or to ask a polite either/or question (どちらがいいですか).",
"何 shifts to なん before だ/です, before some counters (何人、何時), and before n/d/t sounds generally, while なに is used more as a standalone question or before other consonants — worth listening for in native speech.",
"だれ is neutral in politeness; どなた is the respectful equivalent used when asking about someone senior or a stranger you're addressing formally.",
"いつ can be answered with anything from a specific date to a vague time expression (今度、いつか), making it more flexible than asking for a specific 何時 or 何日.",
"どこ pairs naturally with に/で/へ depending on whether you're asking about existence, action location, or direction — the particle doesn't change, the following verb determines the meaning.",
"どう is casual; いかが is its polite equivalent, commonly heard from service staff (お飲み物はいかがですか, would you like something to drink?).",
"いくつ literally counts native-counter items (ひとつ、ふたつ...) up to about ten, and by extension is used to casually ask a young child's age instead of the more adult 何歳。",
"いくら asks specifically about price or cost and cannot be used for general quantity — for \"how many,\" use いくつ or a specific counter with 何。",
"どうして is more common and neutral in speech; なぜ appears more in writing, formal speech, or when the question carries a slightly more serious or analytical tone.",
"Japanese numbers combine a native system (ひとつ、ふたつ...) with a Sino-Japanese system (いち、に、さん...) borrowed from Chinese — which one you use depends entirely on the counter word that follows.",
"This native counter is the default \"catch-all\" for objects when you don't know the specific counter, but it only goes up to とお (ten); beyond that, switch to Sino-Japanese numbers (じゅういち, etc.).",
"Almost all counters have irregular readings at 1 and 2, and 人 is a classic example: 一人 (ひとり) and 二人 (ふたり) don't follow the regular いちにん/ににん pattern that resumes from three onward.",
"A subtle but important distinction: 時 answers \"at what time,\" while 時間 answers \"for how long\" — 三時に会います (I'll meet you at 3 o'clock) vs 三時間待ちます (I'll wait for three hours).",
"Days of the month have irregular native readings for the first ten days and the 14th, 20th, and 24th (ついたち、ふつか、みっか...はつか) that must be memorized individually.",
"歳 and 才 are interchangeable in casual writing, though 歳 is more standard; the one irregular reading to remember is 二十歳 (はたち), breaking from the otherwise regular にじゅっさい pattern.",
"そして simply sequences two separate sentences and works for almost any connection, though in very casual speech it can sound slightly bookish compared to just pausing or using それで。",
"でも starts a new sentence with a contrast to what was just said; its formal written counterpart is しかし, while だけど is the casual spoken equivalent.",
"When から attaches to a full clause rather than a noun, it means \"because,\" with the reason stated first and the result following — a direct, personal way to give a reason, slightly less formal than ので.",
"This が sits at the end of one clause to soften a contrast or transition into the next, functioning like でも but woven into a single sentence — very common in polite speech to soften bad news or disagreement.",
"それから emphasizes that the second event happened after the first in time, making it feel more like a narrated sequence of events than the more neutral そして。",
"とても intensifies a positive statement, while あまり must be paired with a negative predicate to mean \"not very\" — using あまり with a positive verb/adjective is a common learner error when translating \"very\" directly.",
"よく modifies verbs to mean either \"often\" (frequency) or \"well/skillfully\" (quality), with context distinguishing the two, while たくさん specifically quantifies \"a lot\" of something.",
"もう pairs naturally with a past-tense verb (\"already done\"), while まだ pairs with a negative verb for \"not yet\" (まだしていません) — using まだ with a past-affirmative verb doesn't make grammatical sense.",
]

N4_EXPLANATIONS = [
"てから emphasizes that the first action is fully completed before the second begins, making it more emphatic about sequence than a plain て form linking two verbs — compare 起きて、顔を洗います (simple sequence) with 起きてから、顔を洗います (only after waking up).",
"前に always takes the dictionary (plain non-past) form of the verb, even when the whole sentence describes a past event, because it marks a fixed relationship between two actions, not the tense of the sentence — 寝る前に本を読みました uses 寝る, not 寝た.",
"間に marks a short, one-time event occurring at some point within a longer background period. The key test: did the main action happen briefly during the period, or would it be odd to say it lasted the whole time? If brief, use 間に, not 間.",
"間 (without に) means both actions span the same length of time throughout. Testing whether your action is a \"point\" (間に) or an ongoing \"duration\" (間) is one of the trickiest N4 distinctions.",
"てしまう often carries a nuance of regret, surprise, or an unintentional/uncontrollable action, though with achievement verbs it can simply emphasize thorough completion without any negative feeling — tone and context determine which reading applies.",
"おく carries two related meanings: preparing something in advance for future benefit (準備しておきます) and deliberately leaving something in its current state (窓を開けておきます) — both share the idea of a deliberate, future-oriented choice.",
"てみる always implies an attempt whose outcome isn't yet known — 食べてみます specifically frames the act as an experiment or trial, which is why it pairs naturally with new experiences.",
"てくる can describe literal motion toward the speaker, a change unfolding up to the present moment (寒くなってきました, it has gotten cold and continues), or an action begun in the past continuing to now — the metaphorical \"toward now/here\" sense is trickiest for learners.",
"ていく mirrors てくる but points away from the speaker/present moment instead — for change verbs, it frames a trend continuing into the future (寒くなっていきます), the mirror image of てくる's \"up to now.\"",
"ながら requires both actions to be done by the same single subject at the same time, with the second verb being the main, focused action. It cannot be used when two different people are doing two different simultaneous things.",
"あげる can feel slightly presumptuous toward someone of higher status, since it frames the act as \"doing someone a favor.\" さしあげる is the humble version for social superiors; やる is a rougher casual version for plants, animals, or clear subordinates.",
"くれる is the mirror image of あげる — the direction of benefit always flows toward the speaker or their in-group, which is why the giver, not the receiver, is the grammatical subject. くださる is the polite counterpart from a superior.",
"Unlike あげる/くれる, もらう keeps the receiver (often the speaker) as the subject regardless of direction, and the giver is marked with に or から. いただく is the humble equivalent used when receiving from someone of higher status.",
"Attaching these to the て-form extends the giver/receiver logic to actions done as favors rather than physical objects — 手伝ってくれた (helped me, as a favor) carries real gratitude nuance that a plain 手伝った lacks.",
"と describes an automatic, mechanical, or habitual cause-and-effect relationship and cannot be followed by a command, request, invitation, or expression of will in the result clause — this rules out sentences like 春になると旅行しましょう, which needs たら instead.",
"ば works well for general truths, proverbs, and hypotheticals focused on the condition itself, and traditionally shares と's restriction against volitional results, though modern usage relaxes this when the subjects of condition and result differ. Of the four, ば feels the most literary.",
"たら is the most flexible and widely used conditional in everyday speech, covering hypothetical, definite future, and single completed past-triggered events, and unlike と/ば it freely allows commands and invitations in the result clause — when unsure which conditional to use, たら is usually safe.",
"なら is unique because it responds to a topic the listener has just raised, commenting on the premise itself rather than predicting a future consequence — 日本に行くなら means \"given you're talking about going to Japan, [here's my advice],\" which is why advice pairs so naturally with なら.",
"ても is the concessive counterpart to the other conditionals — instead of \"if X, then Y,\" it says \"even in the case of X, Y still holds,\" directly countering an assumption the listener might have (雨が降っても行きます counters the assumption that rain would stop the plan).",
"The potential form is more natural and common in speech than ことができます, and once formed it always conjugates like an ichidan verb afterward regardless of the original group. Note the object particle often shifts from を to が (漢字が読めます).",
"Beyond \"was done to,\" Japanese passive has a distinctive \"adversity passive\" (迷惑の受身) used even with intransitive verbs to show the speaker was negatively affected, such as 雨に降られました (I got rained on, inconveniently) — an emotional nuance with no direct English equivalent.",
"Context determines whether causative means \"force someone to do something\" or \"allow/let someone do something.\" The \"let\" meaning commonly appears with てあげる/てくれる/てもらう, as in 子供に遊ばせてあげました (I let my child play, as a kindness).",
"This combines causative and passive to express \"being made to do something against one's will,\" almost always used when the speaker feels put-upon, unlike the neutral or willing \"let\" sense of the plain causative.",
"A handful of extremely common verbs (行く/来る/いる→いらっしゃる、食べる/飲む→召し上がる、言う→おっしゃる、する→なさる) have entirely separate honorific vocabulary, taking priority over れる/られる or お+stem+になる when talking about someone of higher status.",
"Mirror image of 尊敬語 — special humble verbs (行く/来る→参る、する→いたす、言う→申す、見る→拝見する、もらう→いただく) lower the speaker's own actions to elevate the listener, typically reserved for formal, business, or service contexts.",
"This hearsay そうです attaches to the full plain form (verb/adjective/noun+だ) and reports what the speaker heard elsewhere, without commenting on their own confidence — easy to confuse with the visual そうです below, which attaches to a stem instead.",
"This visual そうです is based on the speaker's own direct sensory impression and attaches to a stem, not the plain form — 雨が降りそうです (looks like rain, from the sky) contrasts sharply with 雨が降るそうです (I heard it'll rain, hearsay) despite differing by one letter.",
"ようです is based on the speaker's own reasoning or indirect evidence, giving it a more personal, subjective feel than らしいです, which leans on external information or general reputation. It's also considered a bit more polite/literary than the casual みたいです。",
"らしいです is grounded in something the speaker heard or knows to be generally true, carrying a slightly more detached \"so I'm told\" feel than the personally-reasoned ようです。 Separately, らしい directly on a noun (男らしい) means \"typical of,\" an unrelated but related-looking use.",
"でしょう expresses the speaker's own prediction with fairly high confidence, and with rising intonation becomes a soft way of seeking agreement (\"...right?\") rather than stating a guess — the function depends entirely on intonation in speech.",
"かもしれません signals genuinely uncertain possibility, weaker than でしょう, and unlike the other conjecture forms, doesn't require any particular evidence or reasoning behind it — it can be a pure guess with no basis at all.",
"はずです isn't a guess — it expresses strong logical expectation based on known facts or reasoning (\"it stands to reason that...\"), which is why it sounds surprised when reality contradicts it (もう着いているはずなのに, they should have already arrived...).",
"Literally \"if [I] don't do X, it won't do\" — this double-negative construction is why it looks complex, but functionally it's simply the standard, formal way to state an obligation. なければいけません is a near-synonymous alternative.",
"The negative counterpart of てもいいです (\"even if [I] don't do X, it's fine\"), following the same logic — the standard way to release someone from an expectation they might otherwise assume applies.",
"This is advice, not obligation, so it's noticeably softer than なければなりません — said too bluntly, especially to someone you don't know well, it can still come across as a strong opinion, so speakers often soften it with かもしれません or んじゃないですか。",
"The negative advice counterpart, built on the ない形 rather than the た形 used in the affirmative — a subtle but important base-form distinction between the positive and negative versions of this pattern.",
"つもりです states the speaker's own settled intention and can sound blunt or accusatory used to ask about someone else's plans directly (何をするつもりですか can sound like \"what exactly do you intend to do?\") — 予定 is often safer for neutral questions.",
"予定です describes a scheduled, often externally fixed plan rather than personal resolve, making it neutral and safe when asking about someone else's schedule, unlike the more personal-sounding つもりです。",
"This softens a decision by framing it as something the speaker is currently leaning toward, rather than a firm commitment like つもりです — commonly used announcing a fresh decision in the moment; と思っています implies the decision has been held for a while already.",
"ことにする frames the decision as actively chosen by the speaker's own will, even for small everyday choices (毎日運動することにしました) — the resulting decision is typically ongoing/habitual rather than a one-off action.",
"ことになる deliberately avoids naming who made the decision, which is why it's natural for decisions made by circumstances, a company, or another authority rather than the speaker — using ことにする here would incorrectly claim personal agency over someone else's decision.",
"This simply extends adjective conjugation logic to describe change over time rather than a static state — く for い-adjectives, に for な-adjectives/nouns, following the exact same pattern as adverb formation.",
"ようになる specifically marks a gradual shift in ability or habit that emerged over time, distinct from a single instant of change — 漢字が読めるようになりました emphasizes the gradual process, not one moment.",
"This is the causative counterpart of くなる/になる — instead of something changing on its own, someone actively makes it change, following the same く/に split based on adjective type.",
"This describes experience at any point in an unspecified past and shouldn't be used for something that happened at a specific, recently-known time (use the plain past tense for that instead) — it answers \"have you ever,\" not \"did you.\"",
"たり always appears at least twice (or with \"and so on\" implied after the last) to list a few representative activities among possibly many others, and pairs naturally with 週末は、休みの日は — using only one たり sounds incomplete.",
"Don't confuse this present-tense ことがあります (occasional occurrence, \"sometimes happens\") with the past-tense たことがあります (experience, \"have done before\") — the difference is entirely in whether the preceding verb is dictionary form or た form.",
"すぎる attaches to a stem (verb stem, or adjective stem with the final い/だ dropped) and always implies the amount crossed from \"enough\" into \"too much,\" carrying a negative or excessive nuance even when the underlying quality is normally positive.",
"やすい conjugates exactly like a normal い-adjective (やすかったです、やすくないです) and describes ease from a general or objective standpoint, not necessarily the speaker's personal preference.",
"The direct negative counterpart of やすい, describing something inherently difficult to do, following the same い-adjective conjugation pattern.",
"Beyond rough quantity estimates, くらい/ほど can express degree through a vivid comparison (\"to the extent that...\"), often with an exaggerated example, as in 泣きたいくらい嬉しい — ほど tends to sound slightly more formal/written than くらい in this usage.",
"The item being favored/compared always sits directly before のほうが, while より marks the item compared against — Japanese comparison structure works essentially in reverse order compared to English \"more X than Y.\"",
"一番 must sit directly in front of the adjective or verb it modifies, and the group compared within is marked by の中で (\"among/within\") — for comparing just two things, use より〜のほうが instead of a superlative.",
"This states that A falls short of B on some scale, always paired with a negative predicate — unlike より〜のほうが, which actively ranks two things, ほど〜ない focuses on the gap rather than which one wins.",
"The quoted clause keeps its own original tense and plain form regardless of when the reporting sentence is set, and と can quote either direct speech or, more commonly at this level, indirect/reported speech without a direct quote.",
"と思います softens an opinion or prediction, the standard, humble way Japanese speakers state their own views rather than asserting flat fact — omitting it entirely can sound unnecessarily blunt or overconfident in many everyday contexts.",
"という bridges an unfamiliar name, term, or quote to the noun it names, especially useful for introducing something the listener likely hasn't heard of yet (「げんき」という本) — without という, placing two nouns together wouldn't convey the \"called/named\" relationship.",
"ために requires the subject of both clauses to be the same willing agent pursuing a deliberate goal, and the preceding verb must be a volitional action the subject actively controls — the key test that separates it from ように below, used when that control is absent.",
"ので presents a reason as an objective, almost self-evident fact rather than a personal justification, sounding noticeably more polite and less confrontational than から — often preferred when declining an invitation or explaining an inconvenience to someone you don't know well.",
"し doesn't just state one reason — it implies additional, unstated reasons supporting the same conclusion, giving statements a slightly more persuasive, \"and on top of that\" feel compared to a single ので or から。",
"のに always carries an emotional charge of surprise, frustration, or unmet expectation about the gap between the two clauses, setting it apart from the neutral factual contrast of けど/が — 頑張ったのに失敗した implies the speaker feels it's unfair.",
"This ように is used precisely when the verb describes something outside the subject's direct volitional control (potential forms, non-volitional verbs like 忘れる、わかる、できる) — where ために needs an active chosen goal, ように expresses a hoped-for outcome only indirectly influenced.",
"This turns any verb's stem into \"the way of doing X\" and is extremely productive — nearly any action verb can form a 方 noun this way (食べ方、話し方、使い方), making it one of the most versatile N4 patterns for building new vocabulary on the fly.",
"まま emphasizes that a state was left unchanged, often against expectation or without the usual accompanying action — 靴を履いたまま部屋に入る draws attention to the (often impolite, in Japan) fact of not removing shoes as one normally would.",
"This attaches to the verb stem and conjugates like any regular ichidan verb once attached, describing the onset of an action rather than the action's ongoing existence.",
"The mirror image of 始める, marking completion — for verbs describing a state rather than a discrete completable action, 終わる may sound unnatural, so it's most common with clearly bounded activities like eating, writing, or reading.",
"続ける emphasizes an unbroken continuity over time, often paired with duration expressions (十年間、ずっと) to highlight persistence or dedication.",
"出す specifically frames the onset as sudden or unexpected, distinguishing it from the more neutral 始める — 泣き出す implies the crying started abruptly, without warning, which 泣き始める wouldn't necessarily convey.",
"Phrasing the request in the negative-question form of くれる (\"won't you do this favor for me?\") softens it considerably compared to a plain てください, a natural everyday level of politeness among peers or slight acquaintances.",
"いただく is the humble form of もらう, so this request literally asks \"could I possibly receive the favor of you doing X?\" — one of the most polite common request forms in everyday Japanese, appropriate for strangers, customers, or superiors.",
"This honorific request pattern is common in customer service, announcements, and formal writing (お待ちください) — it can't be used with する-verbs or certain irregular verbs, which have their own separate honorific request forms.",
"The same conjugation used for the passive voice doubles as a milder, easier-to-produce honorific for someone else's actions — less formal than お+stem+になる or the special honorific verbs, a practical middle ground for everyday polite speech.",
"This is more clearly and consistently honorific than れる/られる, since れる/られる can be ambiguous with the passive or potential forms depending on context — お+stem+になる is unambiguously respectful.",
"This humbly frames an action as something the speaker does only with the (assumed) permission of the listener, even without explicit permission granted — extremely common in Japanese workplace/service language to politely announce one's own actions.",
"について marks the topic being discussed, written about, or considered, and is more specific/formal than simply using は for a general topic — especially common in essay titles, presentations, and formal writing (〜について書きなさい)。",
"として marks a role, capacity, or category someone/something occupies, distinct from identity itself — 彼は先生として働いています says he works in the role of a teacher, without claiming \"teacher\" defines his whole identity.",
"によって has two related uses: showing that something varies depending on a factor (人によって違います) and marking the agent of a passive action in more formal/written Japanese (この本は夏目漱石によって書かれた) — the second, literary use is worth recognizing even if less often produced.",
"に対して marks the target or recipient of an attitude, action, or comparison, often implying a contrast or directed relationship — frequently seen in comparisons like AがBに対して〜 (A, in contrast to B, is ~)。",
"にとって frames a judgment as true specifically from a particular person's standpoint, which is why it pairs naturally with adjectives of importance or difficulty (大切、難しい) — it marks perspective, not a direct grammatical object.",
"さえ singles out an extreme, least-likely example to make a point about everything else by implication — 子供さえ分かります implies that if even a child understands it, surely everyone else does too, a rhetorically strong form of emphasis.",
"こと turns an entire verb phrase into an abstract noun referring to the act or fact of doing something, required after certain predicates like 趣味は〜こと、〜ことができる、〜ことがある — の can substitute in some but not all of these contexts.",
"さ converts a quality (面白い, interesting) into a measurable, abstract noun (面白さ) — especially useful for asking about or comparing degrees, as in 高さ (height) or 長さ (length), turning subjective adjectives into something quantifiable.",
"それで states a natural, often unplanned result or consequence following from what was just said, with a slightly more narrative, \"and so\" feel than the more logical/formal だから。",
"けれど(も) functions just like が/でも but sits at a slightly more formal/literary register, common in writing, speeches, or careful speech — が remains the more neutral, everyday default for the same contrastive meaning.",
"Adding たとえ before a ても-conditional emphasizes the extremeness or unlikeliness of the hypothetical being conceded, similar to English \"even if [something this extreme] happens\" — an intensifier for ても, not a separate structure on its own.",
"それに adds a second, reinforcing point in the same direction as the first (rather than contrasting, like でも), often used to pile on additional reasons or qualities, similar in feeling to English \"and what's more.\"",
"This is functionally identical to てもいいです but carries a slightly more formal, considerate tone, often used in written notices or careful spoken contexts — かまいません literally means \"it doesn't matter/I don't mind.\"",
"ずに is the more formal, literary equivalent of ないで, built irregularly from the negative stem (which is why する becomes せずに instead of the expected しずに) — in casual conversation, ないで remains far more common.",
"ばかり emphasizes subjective recency — the action might technically have happened minutes or longer ago, but the speaker frames it as having \"just now\" occurred, often to explain why they're not ready to do something else yet.",
"ところ here marks the precise moment right at an action's completion, focusing more on the exact point in time than ばかり's sense of \"recency\" — the two often overlap in practice, but ところ leans toward pinpointing a moment.",
"Using the dictionary form before ところ shifts the meaning entirely to \"about to,\" describing a moment right before an action begins rather than right after it ends — the verb form is what changes the entire meaning of this ところ family.",
"With the progressive て form before ところ, the focus shifts to being caught in the middle of an ongoing action right now — るところ／ているところ／たところ together form a complete \"about to / in the middle of / just finished\" system.",
"おかげで attributes a positive outcome to someone or something's help or influence, often used with genuine gratitude, sometimes even ironically for a mixed blessing — it almost never introduces a negative outcome, which is what せいで is for instead.",
"せいで is the direct negative counterpart of おかげで, assigning blame for an unwanted outcome — using せいで about your own actions can sound like avoiding responsibility, so it's often softened or avoided when the \"cause\" is the speaker themselves.",
"This carefully denies a specific implication or assumption without a full, blunt denial — 嫌いなわけではない doesn't claim to like something, it just pushes back against the assumption of active dislike, useful for nuanced, softened disagreement.",
"This expresses the speaker's strong personal conviction that something is logically impossible or absolutely untrue, often with an incredulous or exasperated tone — stronger and more emotionally charged than a simple negative statement.",
"に違いない expresses strong, confident conviction based on evidence or reasoning, similar in strength to わけがない but focused on asserting what must be true — it sits above でしょう and かもしれません on the confidence scale, just below stating plain fact.",
"がる converts a first-person feeling/desire word (たい、ほしい、嬉しい、いや) into a description of a third person's observed or inferred feelings, since Japanese grammar generally avoids directly asserting what's inside someone else's mind.",
"This suggestion pattern is built on ては (drawing attention to one option among possibilities) plus どうですか, giving it a slightly more formal, considered feel than the very common, casual たらどうですか below.",
"The most common, casual way to offer friendly advice in daily conversation — often shortened further in very casual speech to just たら? on its own, with どうですか dropped entirely.",
]

N5_READINGS = [
"わ","が","お","に","に","え","で","で","と","と","も","から","まで","の","の","か","や","だけ","しか","ね","よ",
"です","じゃありません","でした","じゃありませんでした",
"いけいようし（げんざい）","いけいようし（ひてい）","いけいようし（かこ）","いけいようし（かこひてい）","なけいようし（かつよう）","なけいようし＋めいし","いけいようし＋めいし",
"ます","ません","ました","ませんでした","じしょけい","ないけい","たけい","てけい","ましょう","ましょうか","ませんか",
"ことができます","ています","ています","てもいいです",
"てください","てはいけません","ないでください","てくださいませんか",
"たいです","がほしいです",
"あります","います",
"これ・それ・あれ・どれ","この・その・あの・どの","ここ・そこ・あそこ・どこ","こちら・そちら・あちら・どちら",
"なに／なん","だれ","いつ","どこ","どう・いかが","いくつ","いくら","なぜ・どうして",
"すうじ","つ","にん","じ・じかん","がつ・にち","さい",
"そして","でも","から","が","それから",
"とても・あまり","よく・たくさん","もう・まだ",
]

N4_READINGS = [
"てから","まえに","あいだに","あいだ","てしまう","ておく","てみる","てくる","ていく","ながら",
"あげる","くれる","もらう","てあげる・てくれる・てもらう",
"と","ば","たら","なら","ても",
"かのうけい","うけみけい","しえきけい","しえきうけみけい","そんけいご（きほんどうし）","けんじょうご（きほんどうし）",
"そうです（でんぶん）","そうです（ようたい）","ようです","らしいです","でしょう","かもしれません","はずです",
"なければなりません","なくてもいいです","たほうがいいです","ないほうがいいです",
"つもりです","よていです","（よ）うとおもいます","ことにする","ことになる",
"くなる・になる","ようになる","くする・にする",
"たことがあります","たり〜たりします","ことがあります",
"すぎる","やすい","にくい","くらい・ほど",
"より〜のほうが","のなかでいちばん","ほど〜ない",
"といいました","とおもいます","という",
"ために","ので","し","のに","ように",
"かた","まま",
"はじめる","おわる","つづける","だす",
"てくれませんか","ていただけませんか","お＋どうし stem＋ください",
"れる・られる","お＋どうし stem＋になる","させていただきます",
"について","として","によって","にたいして","にとって","さえ",
"こと","さ",
"それで","けれども","たとえ〜ても","それに",
"てもかまいません","ずに","たばかり","たところ","るところ","ているところ",
"おかげで","せいで","わけではない","わけがない","にちがいない","がる",
"てはどうですか","たらどうですか",
]

assert len(N5_READINGS) == len(N5), f"N5 readings mismatch: {len(N5_READINGS)} vs {len(N5)}"
assert len(N4_READINGS) == len(N4), f"N4 readings mismatch: {len(N4_READINGS)} vs {len(N4)}"
print("N5 readings OK, N4 readings OK")
print("N4 explanations:", len(N4_EXPLANATIONS), "| N4 entries:", len(N4))
assert len(N5_EXPLANATIONS) == len(N5), "N5 explanation count mismatch"
assert len(N4_EXPLANATIONS) == len(N4), "N4 explanation count mismatch"

print("N5 count:", len(N5))
print("N4 count:", len(N4))

# ---------------------------------------------------------------------------
# Build rows with cross-referenced vocabulary / kanji, then write CSV files
# ---------------------------------------------------------------------------

FIELDNAMES = [
    "type", "level", "skill", "topics", "japanese", "reading", "meaning", "explanation", "formation",
    "example", "example_reading", "example_meaning",
    "related_vocabulary", "related_kanji",
    "source", "source_ref", "tags", "notes",
]

SOURCE_NOTE = "Compiled from standard JLPT grammar references; cross-check against Genki/Minna no Nihongo/Bunpro recommended"

# Overrides pulled directly from the real grammar-template.csv seed rows, keyed on the
# original (level, pattern-text-with-tilde) so the already-authored source/source_ref/tags
# survive the merge instead of being overwritten by the generic SOURCE_NOTE placeholder.
TEMPLATE_OVERRIDES = {
    ("N4", "〜てから"): {"source": "Try! N4", "source_ref": "Unit 8", "tags": "n4-grammar"},
    ("N4", "〜なければなりません"): {"source": "Eigen", "source_ref": "", "tags": ""},
    ("N5", "〜です"): {"source": "", "source_ref": "", "tags": ""},
}


def build_rows(data, explanations, readings, level, vocab_pool, kanji_pool):
    rows = []
    for (topics, pattern, meaning, formation, example, ex_reading, ex_meaning, notes), explanation, reading in zip(data, explanations, readings):
        vmatches = find_vocab(example, vocab_pool)
        kmatches = find_kanji(example, kanji_pool)
        override = TEMPLATE_OVERRIDES.get((level, pattern), {})
        rows.append({
            "type": "grammar",
            "level": level,
            "skill": "grammar",
            "topics": topics,
            "japanese": pattern,
            "reading": reading,
            "meaning": meaning,
            "explanation": explanation,
            "formation": formation,
            "example": example,
            "example_reading": ex_reading,
            "example_meaning": ex_meaning,
            "related_vocabulary": ";".join(vmatches),
            "related_kanji": ";".join(kmatches),
            "source": override.get("source", SOURCE_NOTE),
            "source_ref": override.get("source_ref", ""),
            "tags": override.get("tags", ""),
            "notes": notes,
        })
    return rows


n5_rows = build_rows(N5, N5_EXPLANATIONS, N5_READINGS, "N5", n5_vocab_pool, n5_kanji_set)
n4_rows = build_rows(N4, N4_EXPLANATIONS, N4_READINGS, "N4", n5n4_vocab_pool, n5n4_kanji_set)


def write_csv(path, rows):
    with open(path, "w", newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(rows)


write_csv(OUT + "jlpt-n5-grammar.csv", n5_rows)
write_csv(OUT + "jlpt-n4-grammar.csv", n4_rows)

# quick stats on cross-referencing coverage
n5_with_vocab = sum(1 for r in n5_rows if r["related_vocabulary"])
n4_with_vocab = sum(1 for r in n4_rows if r["related_vocabulary"])
print(f"N5 rows with >=1 matched vocab: {n5_with_vocab}/{len(n5_rows)}")
print(f"N4 rows with >=1 matched vocab: {n4_with_vocab}/{len(n4_rows)}")
