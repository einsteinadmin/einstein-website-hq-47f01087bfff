// Einstein CHOICES Training - Scenario Data
// V2 — 18 scenarios (2-3 per value) for prototype review
// Cameron + Anne will select final 7 for production
// Correct answer distribution: 6A / 6B / 6C — intentionally shuffled

const SCENARIOS = [
    // ==========================================
    // COMMUNICATE (3 scenarios)
    // ==========================================
    {
        id: 1,
        value: "COMMUNICATE",
        valueDescription: "clearly, professionally, and with kindness",
        setup: `You're about 4 hours into a move that was estimated at 5 hours. You're maybe 60% done — this is going to run over. The customer keeps glancing at their watch and asking "How much longer?" Their stress is obvious. The office doesn't know about the delay yet.

What do you do?`,
        choices: [
            {
                id: "a",
                text: "Stop, make eye contact, explain the situation honestly, offer options, and update the office",
                grade: "A",
                feedback: `THIS is the Einstein way.

"Hey, I want to give you an honest update. We're running behind because [specific reason]. I want to make sure we do this right, not fast. Here's what I'm thinking for options..."

The customer exhales. They can adjust their plans. The office is in the loop. Trust builds instead of breaking — all because you spoke up early.`,
                xp: 100
            },
            {
                id: "b",
                text: "Keep working and tell them at the end — no point stressing them out now",
                grade: "C",
                feedback: `The customer had dinner plans at 7. They missed them. They're now hangry AND furious, writing a 1-star review while you wrap their last box. The office gets blindsided with an angry call. Everyone's day is ruined because of delayed honesty. Bad news doesn't age well.`,
                xp: 0
            },
            {
                id: "c",
                text: "Call the office but don't tell the customer yet — let them handle it",
                grade: "B",
                feedback: `Better — you looped in the office. But now the customer gets a call from dispatch saying "your move is running long" while you're right there saying nothing. It looks like you're avoiding the conversation. Communicate TO the customer, not around them.`,
                xp: 50
            }
        ],
        correctChoice: "a",
        proTip: "The longer you wait to share a problem, the bigger it gets. Customers can handle honest updates — what they can't handle is surprises at the end."
    },
    {
        id: 3,
        value: "COMMUNICATE",
        valueDescription: "clearly, professionally, and with kindness",
        setup: `You're on a move and the customer asks your teammate how much longer it'll be. Your teammate says "Oh, we'll definitely have you done by 3." It's 1:30 and you still have to wrap the entire master bedroom plus load the garage. There's no way you're done by 3. The customer smiles and walks away.

What do you do?`,
        choices: [
            {
                id: "a",
                text: "Don't say anything — your teammate made the promise, let them deal with it when it doesn't happen",
                grade: "C",
                feedback: `Now it's 3:15. The customer is confused. "Your partner said 3..." Your teammate is scrambling. The crew looks disorganized. You knew this was coming and said nothing. The customer doesn't care whose promise it was — they see ONE team that didn't deliver.`,
                xp: 0
            },
            {
                id: "b",
                text: "Pull your teammate aside privately: \"Hey, I don't think 3 is realistic — we should give them a more honest timeline so they're not surprised.\"",
                grade: "A",
                feedback: `You didn't throw your teammate under the bus in front of the customer. You didn't let a bad promise stand either. A quick sidebar, an adjusted expectation, and everyone's set up for success. This is what professional communication looks like within a crew — direct, private, and focused on the customer's experience.`,
                xp: 100
            },
            {
                id: "c",
                text: "Jump in and correct it right there: \"Actually, it's probably going to be more like 4:30.\"",
                grade: "B",
                feedback: `Honest? Yes. But you just contradicted your teammate in front of the customer. Now the customer is wondering which one of you knows what you're doing. The right message, the wrong delivery. Communication within the crew should happen privately first.`,
                xp: 50
            }
        ],
        correctChoice: "b",
        proTip: "If you hear something that's going to set the customer up for disappointment, address it with your crew first — privately. One crew, one message."
    },

    // ==========================================
    // HUSTLE (2 scenarios)
    // ==========================================
    {
        id: 4,
        value: "HUSTLE",
        valueDescription: "but don't rush",
        setup: `You just set down a dresser in the bedroom. The truck is 50 feet away in the driveway. Your teammate Marcus is already jogging back to grab the next piece. The customer is sitting on their couch watching you both.

How do you move back to the truck?`,
        choices: [
            {
                id: "a",
                text: "Jog back with purpose — quick but controlled, like a power walk with intention",
                grade: "A",
                feedback: `More ballet than football.

You're moving with urgency but staying controlled. You look professional. You're matching Marcus's pace. The customer sees a synchronized, efficient crew.

When you get to the truck, you're not out of breath. You can immediately assess the next item and lift it safely. Hustle isn't about top speed — it's about sustainable urgency.`,
                xp: 100
            },
            {
                id: "b",
                text: "Sprint back to the truck — time is money!",
                grade: "B",
                feedback: `ZOOM! You're a blur of efficiency!

...until you slip on the wet grass. Or trip over the garden hose. Or arrive at the truck breathing so hard you need a minute before lifting the next 150lb armoire.

Rushing leads to mistakes. Mistakes lead to injuries. Injuries lead to claims. Fast is great, but controlled is essential.`,
                xp: 50
            },
            {
                id: "c",
                text: "Walk at a normal pace — you're already working hard, no need to rush",
                grade: "C",
                feedback: `The customer watches you stroll past while Marcus jogs by a second time.

"Why is that guy moving so slow?" they think. "Am I paying by the hour for that?"

Walking looks lazy even when you're working hard. Perception matters. The customer doesn't feel your sore muscles — they just see your pace. Also, now Marcus is carrying more than you. Not cool.`,
                xp: 0
            }
        ],
        correctChoice: "a",
        proTip: "Never walk back to the truck empty-handed. Even if it's just grabbing some pads or a dolly — there's always something that needs to move. Efficient movers think two steps ahead."
    },
    {
        id: 5,
        value: "HUSTLE",
        valueDescription: "but don't rush",
        setup: `It's 5:30 PM. You've been moving since 7 AM. This is your second job of the day and your legs are heavy. You're on the last load — maybe 30 minutes left. The customer is sitting on their porch, watching. Your teammate is still moving at a solid pace.

Your body wants to walk. What do you do?`,
        choices: [
            {
                id: "a",
                text: "Slow down to a walk — you've been working hard all day and you're running out of gas",
                grade: "C",
                feedback: `The customer watches you downshift from a jog to a stroll. "Is that guy slowing down?" They check the time. They start worrying about how much longer this is going to take.

Your teammate is carrying the same load, same heat, same fatigue — but still moving. Now there's a gap. The last 30 minutes shouldn't undo 10 hours of good work.`,
                xp: 0
            },
            {
                id: "b",
                text: "Match the pace you've had all day — controlled jog, purposeful movement. Take water breaks when you need them, but keep the energy consistent.",
                grade: "A",
                feedback: `Anyone can hustle at 8 AM with fresh legs. Hustling at 5:30 when you're running on fumes? That's discipline.

The customer notices. Your teammate notices. And when you're done, you'll be proud of how you finished — not just how you started. Sustainable means you can keep going safely — take your water breaks, watch for heat signs in yourself and your crew, but keep that controlled urgency all the way to the end.`,
                xp: 100
            },
            {
                id: "c",
                text: "Push harder than usual — sprint everything to finish fast and get out of there",
                grade: "B",
                feedback: `Your body is tired and you're sprinting. This is exactly where injuries happen — a rolled ankle on the driveway, a tweaked back on that last dresser. You're also more likely to scuff a wall or drop something when you're running on empty.

Hustle is about consistent, controlled effort — not a final sprint. And never push past what your body is telling you is safe.`,
                xp: 50
            }
        ],
        correctChoice: "b",
        proTip: "How you finish is how people remember you. Keep the pace, take your water breaks, and never sacrifice safety for speed — especially at the end of a long day."
    },

    // ==========================================
    // OWNERSHIP (3 scenarios)
    // ==========================================
    {
        id: 6,
        value: "OWNERSHIP",
        valueDescription: "over results",
        setup: `You arrive at the warehouse at 7am for your shift. Yesterday's crew left their truck a mess — food wrappers on the floor, straps tangled in a pile, and the floor mats are dirty. Your crew lead hasn't arrived yet.

It's not your mess. What do you do?`,
        choices: [
            {
                id: "a",
                text: "Leave it — you didn't make the mess, it's not your problem",
                grade: "C",
                feedback: `Technically fair? Sure. But here's what happens next:

Your crew lead arrives, sees the mess, and asks "Why didn't you clean this up?" You say "It wasn't me." They say "I didn't ask who made it."

Everyone's starting the day frustrated. The mess is still there. And you've positioned yourself as someone who only does the minimum. The people who say "it wasn't me" are the same people who blame the weather, the customer, "the other guy." That's a pattern — and it's the opposite of ownership.`,
                xp: 0
            },
            {
                id: "b",
                text: "Take photos and send them to your manager complaining about the other crew",
                grade: "B",
                feedback: `The documentation instinct isn't terrible — accountability matters. But you just spent 10 minutes photographing, typing, and sending instead of... just cleaning it up.

The mess is STILL there. Your manager now has drama to deal with instead of a solved problem. Report it if it's a pattern. But solve the problem first.`,
                xp: 50
            },
            {
                id: "c",
                text: "Clean it up, organize the straps properly, and make a mental note to always leave it better than you found it",
                grade: "A",
                feedback: `You spend 10 minutes tidying up. The truck is ready for the day. When your crew lead arrives, they see a clean truck and a mover who takes pride in their equipment.

"Treat it like you bought it yourself" isn't just about avoiding damage — it's about caring for the tools that make your job possible. Future crews will benefit from the standard you just set.`,
                xp: 100
            }
        ],
        correctChoice: "c",
        proTip: "Ownership means asking 'What can I do about this?' instead of 'Whose fault is this?' The first question leads to solutions. The second leads to finger-pointing."
    },
    {
        id: 7,
        value: "OWNERSHIP",
        valueDescription: "over results",
        setup: `You're loading the truck and notice the newest guy on your crew is struggling to wrap a couch. He's using way too much shrink wrap, the padding isn't secure, and it's going to shift in transit. He's trying hard but clearly hasn't been shown the right technique.

You could fix it yourself in 2 minutes or you could take 10 minutes to walk him through it properly.

What do you do?`,
        choices: [
            {
                id: "a",
                text: "Take the 10 minutes — walk him through the technique step by step and let him practice it right there",
                grade: "A",
                feedback: `Yes, it costs you 10 minutes today. But tomorrow? He wraps it right without you. Next week? He's teaching the next new guy.

You just invested in someone's career AND protected every future customer's couch. Taking ownership of a teammate's development isn't extra — it's the job. The best crews build each other up.`,
                xp: 100
            },
            {
                id: "b",
                text: "Let it go — he'll figure it out eventually, and it's not your job to train people",
                grade: "C",
                feedback: `"Not my job" is the most expensive phrase at any company. That poorly wrapped couch shifts in transit, a cushion gets stained, and now there's a claim. He doesn't learn, makes the same mistakes next week, and the crew lead wonders why nobody said anything.

Taking ownership means owning the outcome, not just your tasks.`,
                xp: 0
            },
            {
                id: "c",
                text: "Fix it yourself — it's faster to just do it right",
                grade: "B",
                feedback: `The couch is protected. But tomorrow, he wraps another couch the same wrong way. And the day after that. You solved today's problem but passed it to every future crew he's on.

Quick fixes feel efficient but they're just deferred problems.`,
                xp: 50
            }
        ],
        correctChoice: "a",
        proTip: "When you fix something yourself instead of teaching someone, you've solved it once. When you teach them, you've solved it forever."
    },
    {
        id: 8,
        value: "OWNERSHIP",
        valueDescription: "over results",
        setup: `You're carrying a heavy dresser through a tight hallway and the corner catches the wall, leaving a noticeable scuff. Your crew lead is outside at the truck. The customer is in the other room and didn't see it. Nobody saw it but you.

What do you do?`,
        choices: [
            {
                id: "a",
                text: "Take a photo for yourself just in case, but don't say anything unless the customer brings it up",
                grade: "B",
                feedback: `A photo is smart. But you're preparing a defense instead of doing the right thing. If the customer finds it later, your photo proves you KNEW and didn't say anything. That's worse than no photo at all.

Own it in the moment, not after the fact.`,
                xp: 50
            },
            {
                id: "b",
                text: "Keep moving and hope nobody notices — it's just a scuff",
                grade: "C",
                feedback: `Maybe nobody notices today. Maybe they notice when they're hanging pictures next week. Now there's a claim with no documentation, no context, and a customer who feels deceived. "I didn't see it" is a lie you have to carry.

Ownership means you don't leave problems for other people to discover.`,
                xp: 0
            },
            {
                id: "c",
                text: "Find your crew lead, show them the scuff, document it with a photo, and tell the customer together",
                grade: "A",
                feedback: `You caused it, you own it, you address it — in that order, right away. Your crew lead has your back because you didn't try to hide it. The customer respects the honesty. The claim process is clean.

Ownership means the hardest conversations are the ones you have FIRST, not last.`,
                xp: 100
            }
        ],
        correctChoice: "c",
        proTip: "The hardest time to take ownership is when no one's watching and you could get away with it. That's also when it matters most."
    },

    // ==========================================
    // IMPROVE (2 scenarios)
    // ==========================================
    {
        id: 9,
        value: "IMPROVE",
        valueDescription: "every day with enthusiasm",
        setup: `After a long move, your crew lead Marcus pulls you aside. "Hey, I noticed something today. Your wrapping technique on the mirrors could be tighter — I saw some loose edges. Want me to show you a better method?"

You've been wrapping furniture for months and thought you had it down. How do you respond?`,
        choices: [
            {
                id: "a",
                text: "\"Sure, whatever\" — then continue doing it your way",
                grade: "B",
                feedback: `The verbal agreement followed by zero actual change. Classic.

Marcus notices. He always notices. He's deciding whether to invest his time mentoring you or just let you learn the hard way. You've chosen the hard way. Next time that loose wrap causes a scratch, remember this conversation.`,
                xp: 50
            },
            {
                id: "b",
                text: "\"Absolutely, show me! I want to get better at this.\"",
                grade: "A",
                feedback: `Marcus spends 3 minutes showing you a technique that takes 5 extra seconds but reduces mirror claims by half. You practice it right there. He nods approvingly.

You just got better at your job. Tomorrow you'll be 1% better. Compound that over a year and you're operating at a completely different level. The best movers are always learning — even the veterans.`,
                xp: 100
            },
            {
                id: "c",
                text: "\"I've been doing this for months, I know what I'm doing. Nothing broke, right?\"",
                grade: "C",
                feedback: `You just told a veteran that you know better than them. And you used "nothing broke" as your standard for excellence.

Marcus has seen loose wrapping turn into scratched mirrors. He's trying to help you avoid a costly claim and an angry customer. Your defensiveness just cost you free knowledge AND damaged your relationship with your crew lead.`,
                xp: 0
            }
        ],
        correctChoice: "b",
        proTip: "Feedback is a gift. The people who improve fastest are the ones who actively seek it — not just accept it when it comes."
    },
    {
        id: 10,
        value: "IMPROVE",
        valueDescription: "every day with enthusiasm",
        setup: `You just finished a solid move. No damage, on time, customer was happy and tipped well. On the drive back to the warehouse, your crew lead asks: "How do you think today went?"

What do you say?`,
        choices: [
            {
                id: "a",
                text: "\"Good, no issues.\"",
                grade: "B",
                feedback: `Accurate? Sure. But you just closed the door on a coaching conversation your crew lead was inviting. "No issues" means "I'm not thinking about how to get better."

The best movers treat every job as a film session — what worked, what didn't, what would you change? You don't improve by accident.`,
                xp: 50
            },
            {
                id: "b",
                text: "\"It was fine. Ready to be done though.\"",
                grade: "C",
                feedback: `Your crew lead was reaching out, and you shut it down. "Fine" and "ready to be done" tells them you're clocked out mentally. They'll stop asking. And when they stop asking, you stop growing.

The gap between good and great isn't talent — it's whether you keep pushing when things are already going well.`,
                xp: 0
            },
            {
                id: "c",
                text: "\"Good move. But I noticed we lost some time on the staircase with that sectional — I think if we'd broken it down first it would've been smoother. What do you think?\"",
                grade: "A",
                feedback: `You just turned a good day into a learning moment. Your crew lead sees someone who doesn't coast on success — someone who's always looking for the 1% improvement.

Even on your best days, there's always something to sharpen. That mindset compounds — one small adjustment at a time.`,
                xp: 100
            }
        ],
        correctChoice: "c",
        proTip: "Don't wait for something to go wrong to look for improvement. The best time to ask 'what could be better?' is when everything went right."
    },

    // ==========================================
    // CONSCIENTIOUS (2 scenarios)
    // ==========================================
    {
        id: 11,
        value: "CONSCIENTIOUS",
        valueDescription: "attention to detail",
        setup: `You're about to move a customer's heavy oak bookshelf into their new home. The living room has pristine hardwood floors that look like they were just refinished. The bookshelf has exposed metal feet.

The customer steps out to take a phone call. What's your first move?`,
        choices: [
            {
                id: "a",
                text: "Check the floors for any pre-existing damage and note it if there is any. Make sure the bookshelf is properly wrapped and padded — especially the feet. Then ask the customer if they'd like felt pads on the feet before you set it in place.",
                grade: "A",
                feedback: `Three steps. Sixty seconds. Zero risk. You checked for pre-existing conditions, you protected the piece AND the floor, and you offered a solution the customer didn't even know to ask for.

At Disney, they call this kind of attention to detail "bumping the lamp" — a reference to Who Framed Roger Rabbit, where animators made shadows shift every time a lamp swung. Almost no one consciously notices, but it makes everything feel right. That's what conscientious looks like.`,
                xp: 100
            },
            {
                id: "b",
                text: "Lift it high enough to clear the floor — hardwood is tough, it'll be fine",
                grade: "B",
                feedback: `"It'll be fine" — the three most dangerous words on a move. Hardwood IS tough. But your grip shifts, a metal foot grazes the surface, and now there's a scratch you could have prevented.

Conscientious means never assuming. We don't hope floors are tough — we protect them because they're expensive and they matter to the customer.`,
                xp: 50
            },
            {
                id: "c",
                text: "Lift and go — be efficient, the customer's waiting",
                grade: "C",
                feedback: `SCRRRATCH. That's the bookshelf's metal feet carving a groove into $15,000 worth of refinished hardwood.

The customer comes back from their call to find you frozen over their damaged floor. Now there's a claim, an angry customer, and a conversation nobody wants to have. All because you saved 30 seconds.`,
                xp: 0
            }
        ],
        correctChoice: "a",
        proTip: "Before you place any piece in the new home, check the feet. Wrap what needs wrapping. Offer felt pads. Thirty seconds of prevention beats a week of claims paperwork."
    },
    {
        id: 12,
        value: "CONSCIENTIOUS",
        valueDescription: "attention to detail",
        setup: `You're doing the final walk-through at the customer's old house. Every room looks clear from the doorway. The customer already left for the new house 20 minutes ago — they said "I trust you guys, just lock up when you're done."

How thorough is your walk-through?`,
        choices: [
            {
                id: "a",
                text: "Quick glance in each room from the doorway — everything looks clear",
                grade: "C",
                feedback: `You lock up and drive away. Two hours later, dispatch calls: the customer found a box of baby clothes in the nursery closet and a set of dishes in the top kitchen cabinet. Now someone has to drive back.

The customer is upset. Your crew lead is frustrated. A 2-minute walk-through would have caught both. "Looks clear from the doorway" is not a walk-through.`,
                xp: 0
            },
            {
                id: "b",
                text: "Open every closet, check every shelf, look behind every door, check the garage and the attic. If there's a space, you check it.",
                grade: "A",
                feedback: `You find the box of family photos on the top shelf of the hall closet. The one they forgot about. The one that would have caused a tearful phone call at 9 PM tonight.

Conscientious means checking the spaces people forget exist. Every closet, every cabinet, every shelf. The walk-through isn't a formality — it's your last chance to be thorough.`,
                xp: 100
            },
            {
                id: "c",
                text: "Check the main rooms carefully but skip the garage and storage areas — those were empty when you arrived",
                grade: "B",
                feedback: `The main rooms are clear. But the garage? The customer stashed a toolbox behind the water heater that morning "so it wouldn't get lost." It got left.

You checked 80% of the house thoroughly — but conscientious means 100%. The spaces people forget about are exactly the spaces that need checking.`,
                xp: 50
            }
        ],
        correctChoice: "b",
        proTip: "Walk every room. Open every door. Check every shelf. The customer trusts you with the last look at their home — make it count."
    },

    // ==========================================
    // ELEVATE (3 scenarios)
    // ==========================================
    {
        id: 13,
        value: "ELEVATE",
        valueDescription: "attitudes and have fun",
        setup: `It's August. 101 degrees. You're on the fourth floor of an apartment complex with no elevator. The A/C isn't working in the unit. You're on box #47 of what feels like infinity.

The customer is visibly stressed and apologizing repeatedly for the heat. Your teammate starts muttering: "This is ridiculous... who moves in August... this is the worst..."

What do you do?`,
        choices: [
            {
                id: "a",
                text: "Join in the complaints — this IS brutal and you need to vent",
                grade: "C",
                feedback: `Now there are TWO of you radiating negativity. The customer, already stressed and apologetic, now feels guilty for making your day miserable. Their stress doubles. The move feels even longer.

Complaining doesn't cool you down. It just makes everyone feel worse. You're still hot AND now everyone's in a bad mood.`,
                xp: 0
            },
            {
                id: "b",
                text: "Stay quiet and just push through — don't make it worse",
                grade: "B",
                feedback: `You're not adding to the negativity — that's something. But silence in tough moments can feel cold. The customer is still stressed. Your teammate is still spiraling. Nothing has shifted.

On a good day, you'd be cracking jokes. Today your attitude depends on the circumstances — and that's a B-player pattern. You're not making it worse, but you're not making it better either.`,
                xp: 50
            },
            {
                id: "c",
                text: "Crack a joke, keep the energy up, and make the customer feel like everything's under control",
                grade: "A",
                feedback: `"Hey, at least we're getting our cardio in, right? This beats any gym membership."

The customer laughs. Your teammate cracks a small smile. The heat is still there, but the VIBE just shifted.

You're a thermostat, not a thermometer. You don't just read the room's temperature — you SET it.`,
                xp: 100
            }
        ],
        correctChoice: "c",
        proTip: "Be a thermostat, not a thermometer. Your attitude is contagious — make it worth catching."
    },
    {
        id: 14,
        value: "ELEVATE",
        valueDescription: "attitudes and have fun",
        setup: `You're moving a family out of their home of 15 years. The parents are stressed and snapping at each other about what goes and what stays. Their 8-year-old daughter is sitting on the stairs holding a stuffed animal, teary-eyed. She doesn't want to leave her room.

You're walking past her with a stack of boxes. What do you do?`,
        choices: [
            {
                id: "a",
                text: "Pause for a second. Kneel down and say something like: \"Hey, I bet your new room is going to be even cooler. You get to set it up however you want.\" Then keep moving.",
                grade: "A",
                feedback: `Ten seconds. That's all it took to make a scared kid feel a little better. Her mom overheard and her shoulders dropped an inch. The tension in the house dialed down.

Moving is one of the most stressful days in a family's life — and you just made it a little more human. You're not just moving boxes. You're moving people through a big life change. That's elevation.`,
                xp: 100
            },
            {
                id: "b",
                text: "Ignore it — kids cry, it's not your problem",
                grade: "C",
                feedback: `The parents see a crew member walk past their upset child without a glance. It feels cold, even if unintentional. Moving day is emotional.

The crew that acknowledges that — even in small ways — is the crew that gets a 5-star review and a referral. The one that ignores it just gets paid.`,
                xp: 0
            },
            {
                id: "c",
                text: "Keep walking — it's not your place to talk to their kid and you've got boxes to move",
                grade: "B",
                feedback: `Fair — you're there to move furniture, not play therapist. But Einstein movers aren't just laborers. The best crews read the room and find small moments to make hard days easier.

You don't have to solve the family's stress. But a kind word costs nothing and changes everything.`,
                xp: 50
            }
        ],
        correctChoice: "a",
        proTip: "Moving is a life event, not just a logistics job. Small moments of kindness during stressful days are what customers remember and talk about for years."
    },
    {
        id: 15,
        value: "ELEVATE",
        valueDescription: "attitudes and have fun",
        setup: `You're the crew lead today. Your two crew members showed up in rough shape — one didn't sleep well and is dragging, the other is dealing with personal stuff and hasn't said a word since clocking in. You're heading into a 6-hour move for a customer who specifically requested a "great crew" because she's hosting family this weekend.

How do you set the tone?`,
        choices: [
            {
                id: "a",
                text: "Get frustrated — \"Come on guys, I need you to show up today. This isn't going to work if you're dragging.\"",
                grade: "C",
                feedback: `You just made two people feel worse about a bad day they're already having. Guilt doesn't create energy — it creates resentment. Now you've got a crew that's tired AND annoyed at their crew lead.

Elevation isn't demanding energy — it's creating it.`,
                xp: 0
            },
            {
                id: "b",
                text: "Before you pull out, address it directly: \"I know we're not all feeling 100% today. That's fine — we're human. But this customer is counting on us, so let's bring the energy for the next 6 hours. I've got your backs if you've got mine.\" Then lead by example all day.",
                grade: "A",
                feedback: `You acknowledged reality without dwelling on it. You set the expectation. And then you SHOWED them what the energy should look like.

By lunch, the quiet guy is cracking jokes and the tired guy found his second wind — because energy is contagious when it comes from the top. That's leadership. You didn't ignore the mood — you changed it.`,
                xp: 100
            },
            {
                id: "c",
                text: "Don't say anything — everyone has bad days. Just work hard yourself and hope they match your energy.",
                grade: "B",
                feedback: `Leading by example is good. But silence can be read as "I don't notice" or "I don't care." Your crew is looking to you for the vibe.

Without a word, they'll default to whatever mood they walked in with. Sometimes people need someone to say "we've got this" before they believe it.`,
                xp: 50
            }
        ],
        correctChoice: "b",
        proTip: "The crew lead sets the thermostat for the whole day. Acknowledge the mood, redirect it, then lead by example. People match what they see, not what they're told."
    },

    // ==========================================
    // SUPPORT (3 scenarios)
    // ==========================================
    {
        id: 16,
        value: "SUPPORT",
        valueDescription: "one another generously",
        setup: `You just finished wrapping and padding all the bedroom furniture. Your teammate is in the garage trying to disassemble a heavy treadmill — the bolts are stripped, it's awkward, and he's clearly getting frustrated. Your crew lead is with the customer doing the walk-through.

What do you do?`,
        choices: [
            {
                id: "a",
                text: "Walk over and grab the other end. \"What do you need? I'll hold it steady while you work the bolts.\"",
                grade: "A",
                feedback: `You didn't ask "Need help?" — you just showed up. The treadmill gets disassembled in half the time. Your teammate's frustration evaporates. The crew lead comes back to find the garage cleared and ready to load.

SUPPORT means the move isn't done until EVERYONE'S work is done. Your section being finished doesn't mean your job is finished.`,
                xp: 100
            },
            {
                id: "b",
                text: "Wait for him to ask — you don't want to insult him by assuming he needs help",
                grade: "C",
                feedback: `He's red-faced, wrestling with stripped bolts, clearly losing the battle. Everyone can see he needs help. But you're waiting for an invitation that pride won't let him send.

By waiting, you're making him choose between struggling alone or "admitting weakness." Real support doesn't need an invitation. You see it, you jump in.`,
                xp: 0
            },
            {
                id: "c",
                text: "Call out \"You good over there?\" from across the garage",
                grade: "B",
                feedback: `Better than ignoring it. But "You good?" puts the burden on them to admit they need help. Some people won't ask — pride, not wanting to slow things down, not wanting to look weak.

Real support is proactive. You see someone struggling, you don't ask. You just appear.`,
                xp: 50
            }
        ],
        correctChoice: "a",
        proTip: "Never ask 'Do you need help?' Just show up. The best crews operate like they share one brain — help appears before it's requested."
    },
    {
        id: 17,
        value: "SUPPORT",
        valueDescription: "one another generously",
        setup: `Your crew finishes a move 45 minutes early. Solid day — everything went smooth. On the drive back to the warehouse, dispatch calls: "Hey, there's another Einstein crew about 10 minutes from you. They're behind on a big move and could really use an extra pair of hands for about an hour. You guys willing to swing by?"

You've already worked 9 hours today. What do you do?`,
        choices: [
            {
                id: "a",
                text: "\"Nah, we're done for the day. They'll figure it out.\"",
                grade: "C",
                feedback: `They'll "figure it out." Maybe. But it might mean a customer waiting an extra 2 hours, a crew working until 9 PM, and a bad experience that reflects on ALL of Einstein — not just that crew.

"Not my crew, not my problem" is the support version of "not my job." We're one company, not a collection of trucks.`,
                xp: 0
            },
            {
                id: "b",
                text: "\"I'm pretty tired, but I'll ask my crew.\"",
                grade: "B",
                feedback: `Fair to check in with your team. But the hesitation signals that support has a limit for you — that it depends on how you feel rather than what the team needs.

The best response is leading with yes, not polling for permission.`,
                xp: 50
            },
            {
                id: "c",
                text: "\"Yeah, send us the address. We're on the way.\"",
                grade: "A",
                feedback: `You just showed up for a crew that was drowning. They didn't expect it. The relief on their faces when you walked in was worth more than clocking out early.

That crew will remember this. YOUR crew will remember this. And the customer gets their move done right, on time, by an Einstein team that showed up for each other. Support doesn't stop at your crew — it extends to every Einstein truck on the road.`,
                xp: 100
            }
        ],
        correctChoice: "c",
        proTip: "Einstein is one team across every truck, every branch, every city. When one crew wins, we all win. When one crew struggles, that's our cue to show up."
    },
    {
        id: 18,
        value: "SUPPORT",
        valueDescription: "one another generously",
        setup: `It's a new mover's first day on your crew. He's nervous — moving slowly, double-checking everything, being extra careful. He just wrapped a floor lamp and it looks decent but took him twice as long as it should have. Your crew lead is loading the truck and hasn't said anything.

What do you do?`,
        choices: [
            {
                id: "a",
                text: "Leave him alone — everyone has to learn at their own pace",
                grade: "B",
                feedback: `Not wrong. But "learning at your own pace" on a moving crew means falling behind, getting stressed, and wondering if you're cut out for this.

A little guidance early saves a lot of struggle later. You remember your first day. Someone probably helped you. Pay it forward.`,
                xp: 50
            },
            {
                id: "b",
                text: "Walk over, give him a genuine compliment on something he did right, then show him a quicker method: \"Good instinct protecting the shade — here, let me show you a trick that'll save you some time on the next one.\"",
                grade: "A",
                feedback: `You just did three things in 30 seconds: built his confidence, taught him something useful, and made him feel like part of the crew.

First days are terrifying. One moment of support can turn "I don't know if I can do this" into "I've got people who have my back." That's how you build a teammate, not just a coworker.`,
                xp: 100
            },
            {
                id: "c",
                text: "Redo his work yourself and move on — it's faster than explaining",
                grade: "C",
                feedback: `You just unwrapped his lamp and rewrapped it in front of him without a word. How does he feel right now? Small. Incompetent. Like he's in the way.

He didn't learn anything except that his work wasn't good enough. Tomorrow he'll be even more nervous. Support means building people up, not pushing them aside.`,
                xp: 0
            }
        ],
        correctChoice: "b",
        proTip: "First days shape careers. One moment of patience and encouragement on day one pays dividends for months. Build your crew up — they'll run through walls for you."
    }
];

// Quiz questions (mixing all values)
const QUIZ_QUESTIONS = [
    {
        question: "A customer's antique mirror has a small chip you didn't notice until after the move. What should you do?",
        options: [
            "Don't mention it - they probably won't notice",
            "Point it out and hope they say it was already there",
            "Document it, report it to the office, and be upfront with the customer",
            "Blame it on a previous crew"
        ],
        correct: 2,
        value: "Communicate"
    },
    {
        question: "You're carrying a heavy dresser down a narrow staircase. Your teammate says 'Let's just speed up and get this thing down — we're running behind.' What's the right move?",
        options: [
            "Match his pace — he's right, you're behind schedule",
            "Slow down and take each step deliberately — speed kills on stairs",
            "Keep your current controlled pace and say 'Let's stay steady — we can make up time on the flat stuff'",
            "Stop and wait for more help"
        ],
        correct: 2,
        value: "Hustle"
    },
    {
        question: "At the end of a long day, you notice the truck's interior is dirty and the straps are tangled in a pile. Your shift ended 5 minutes ago. What demonstrates ownership?",
        options: [
            "Leave it — the next crew can handle their own truck",
            "Clean it up and organize the straps so the next crew starts fresh",
            "Text your manager about it",
            "Take a photo and post it in the group chat"
        ],
        correct: 1,
        value: "Ownership"
    },
    {
        question: "A veteran mover suggests a different way to wrap a couch. How should you respond?",
        options: [
            "My way works fine, thanks",
            "I'll try it your way for the rest of today",
            "Show me your technique - I'm always looking to improve",
            "That's how they did it at my old company"
        ],
        correct: 2,
        value: "Improve"
    },
    {
        question: "Before moving furniture across a hardwood floor, you should FIRST:",
        options: [
            "Lift it high enough to clear the floor",
            "Ask the customer if they care about scratches",
            "Check for existing damage and make sure the piece is properly wrapped and padded",
            "Move quickly so there's less time for scratches"
        ],
        correct: 2,
        value: "Conscientious"
    },
    {
        question: "On a brutally hot day, your teammate starts complaining. You should:",
        options: [
            "Join in - venting helps",
            "Tell them to stop being negative",
            "Stay silent and keep working",
            "Shift the energy with humor and keep spirits up"
        ],
        correct: 3,
        value: "Elevate"
    },
    {
        question: "You finish your work and your teammate is struggling alone with a heavy piece. You should:",
        options: [
            "Take a quick break - you earned it",
            "Ask if they need help",
            "Jump in without being asked",
            "Wait for them to figure it out"
        ],
        correct: 2,
        value: "Support"
    },
    {
        question: "Which statement best captures why culture matters at Einstein?",
        options: [
            "It makes training easier",
            "Competitors can copy everything except culture",
            "It looks good on the website",
            "Corporate requires it"
        ],
        correct: 1,
        value: "Culture"
    },
    {
        question: "A customer asks how much longer the move will take. You're running 2 hours behind. You should:",
        options: [
            "Say 'almost done' to keep them calm",
            "Give them an honest update and explain why",
            "Avoid the question and keep working",
            "Tell them to call the office"
        ],
        correct: 1,
        value: "Communicate"
    },
    {
        question: "What's the difference between a thermometer and a thermostat in the context of attitudes?",
        options: [
            "One is digital, one is manual",
            "Thermometers read the room; thermostats change it",
            "They're basically the same thing",
            "Thermostats are more expensive"
        ],
        correct: 1,
        value: "Elevate"
    },
    {
        question: "You're walking back to the truck after setting down a box. You should:",
        options: [
            "Walk normally to conserve energy",
            "Sprint to impress the customer",
            "Jog with purpose and grab something useful on the way",
            "Check your phone while walking"
        ],
        correct: 2,
        value: "Hustle"
    },
    {
        question: "The Luling cross-country team keeps winning state championships despite being from a tiny town. Why?",
        options: [
            "They recruit the best runners",
            "They have superior facilities",
            "They have a championship culture",
            "They cheat"
        ],
        correct: 2,
        value: "Culture"
    },
    {
        question: "'Treat it like you bought it yourself' refers to:",
        options: [
            "Customer belongings only",
            "The moving truck and equipment too",
            "Just the expensive items",
            "Nothing - it's just a saying"
        ],
        correct: 1,
        value: "Ownership"
    },
    {
        question: "What's the Einstein approach to receiving feedback?",
        options: [
            "Feedback is optional for experienced movers",
            "Only accept feedback from managers",
            "Feedback is a gift - actively seek it",
            "Defend your current methods"
        ],
        correct: 2,
        value: "Improve"
    },
    {
        question: "Why do we check for pre-existing damage before a move?",
        options: [
            "To have something to blame",
            "To protect both the customer and the crew",
            "Because the office requires it",
            "Only for expensive items"
        ],
        correct: 1,
        value: "Conscientious"
    }
];

// Achievements
const ACHIEVEMENTS = {
    firstChoice: {
        id: "firstChoice",
        name: "First Choice",
        description: "Complete your first scenario",
        icon: "🎯"
    },
    perfectRun: {
        id: "perfectRun",
        name: "Perfect Run",
        description: "Get all A-Player choices in scenarios",
        icon: "⭐"
    },
    cultureChampion: {
        id: "cultureChampion",
        name: "Culture Champion",
        description: "Pass the final quiz on first try",
        icon: "🏆"
    },
    selfAware: {
        id: "selfAware",
        name: "Self-Aware",
        description: "Complete the honest self-assessment",
        icon: "🪞"
    },
    xpMaster: {
        id: "xpMaster",
        name: "XP Master",
        description: "Earn 800+ XP total",
        icon: "💎"
    },
    curiousMind: {
        id: "curiousMind",
        name: "Curious Mind",
        description: "Some things reward a closer look",
        icon: "🔍"
    }
};

// CHOICES value data for reference/display
const CHOICES_VALUES = [
    {
        letter: "C",
        value: "Communicate",
        description: "clearly, professionally, and with kindness"
    },
    {
        letter: "H",
        value: "Hustle",
        description: "but don't rush"
    },
    {
        letter: "O",
        value: "Ownership",
        description: "over results"
    },
    {
        letter: "I",
        value: "Improve",
        description: "every day with enthusiasm"
    },
    {
        letter: "C2",
        value: "Conscientious",
        description: "attention to detail"
    },
    {
        letter: "E",
        value: "Elevate",
        description: "attitudes and have fun"
    },
    {
        letter: "S",
        value: "Support",
        description: "one another generously"
    }
];
