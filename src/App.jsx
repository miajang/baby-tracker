import { useState, useEffect, useRef } from "react";

const BRAND = "#237a82";
const C={h:"#333",body:"#444",sec:"#666",help:"#777"};

const themes = {
  pink: { pri:"#d4899e",lt:"#fefafb",mid:"#f0cdd6",dk:"#b8707e",badge:"#fceef2",badgeTxt:"#b8707e",learn:"#d4899e",hover:"#fdf0f4",contBg:"#fefcfd" },
  blue: { pri:"#6a9fd8",lt:"#f5f9fd",mid:"#bcd5ee",dk:"#4a7fb8",badge:"#e8f1fa",badgeTxt:"#4a7fb8",learn:"#6a9fd8",hover:"#eef5fc",contBg:"#f8fafc" },
  sage: { pri:"#7fa87a",lt:"#f5f8f4",mid:"#c4d6c1",dk:"#5e8a58",badge:"#e8f0e6",badgeTxt:"#5e8a58",learn:"#7fa87a",hover:"#eef4ed",contBg:"#f8f9f7" }
};
const themeColors = ["pink","blue","sage"];

const NavIcon = ({type,color}) => {
  const s = {width:16,height:16,stroke:color,fill:"none",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};
  if(type==="tracker") return <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
  if(type==="growth") return <svg viewBox="0 0 24 24" style={s}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
  if(type==="milestones") return <svg viewBox="0 0 24 24" style={s}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
  if(type==="education") return <svg viewBox="0 0 24 24" style={s}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
  if(type==="resources") return <svg viewBox="0 0 24 24" style={s}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
  if(type==="summary") return <svg viewBox="0 0 24 24" style={s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
  if(type==="chat") return <svg viewBox="0 0 24 24" style={s}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
  return null;
};

const whoWeightBoys=[[3.3,4.5,5.6,6.4,7.0,7.5,7.9,8.3,8.6,8.9,9.2,9.4,9.6]];
const whoWeightGirls=[[3.2,4.2,5.1,5.8,6.4,6.9,7.3,7.6,7.9,8.2,8.5,8.7,8.9]];
const whoLengthBoys=[[49.9,54.7,58.4,61.4,63.9,65.9,67.6,69.2,70.6,72.0,73.3,74.5,75.7]];
const whoLengthGirls=[[49.1,53.7,57.1,59.8,62.1,64.0,65.7,67.3,68.7,70.1,71.5,72.8,74.0]];

function getPercentileLabel(val,monthIdx,type){
  if(val==null||monthIdx<0||monthIdx>12)return null;
  const mo=Math.min(Math.round(monthIdx),12);
  if(type==="weight"){const median=(whoWeightBoys[0][mo]+whoWeightGirls[0][mo])/2;const vk=val*0.453592;const r=vk/median;if(r>=1.15)return"Above 85th";if(r>=1.05)return"~75th";if(r>=0.97)return"~50th";if(r>=0.90)return"~25th";if(r>=0.82)return"~10th";return"Below 10th";}
  else{const median=(whoLengthBoys[0][mo]+whoLengthGirls[0][mo])/2;const vc=val*2.54;const r=vc/median;if(r>=1.06)return"Above 85th";if(r>=1.03)return"~75th";if(r>=0.98)return"~50th";if(r>=0.94)return"~25th";if(r>=0.90)return"~10th";return"Below 10th";}
}

function getSleepRec(ageMonths){
  if(ageMonths<4) return {nightLo:8,nightHi:9,napLo:4,napHi:6,napCountLo:3,napCountHi:5,perNap:"30 min-2 hrs (irregular at this age)",totalLo:14,totalHi:17};
  if(ageMonths<7) return {nightLo:10,nightHi:11,napLo:2.5,napHi:3.5,napCountLo:2,napCountHi:3,perNap:"45 min-1.5 hrs each",totalLo:12,totalHi:16};
  if(ageMonths<10) return {nightLo:10,nightHi:12,napLo:2,napHi:3,napCountLo:2,napCountHi:2,perNap:"about 1-1.5 hrs each",totalLo:12,totalHi:16};
  return {nightLo:10,nightHi:12,napLo:2,napHi:3,napCountLo:1,napCountHi:2,perNap:"about 1-2 hrs each",totalLo:12,totalHi:16};
}

function getNightEval(name,mins,ageMonths,pr){
  if(mins<=0) return null;
  const hrs=mins/60;const rec=getSleepRec(ageMonths);
  if(hrs>=rec.nightHi) return `Great night! ${name} got ${formatDurationExact(mins)} of night sleep - above the recommended ${rec.nightLo}-${rec.nightHi} hours of night sleep for ${pr.pos} age. Well rested!`;
  if(hrs>=rec.nightLo) return `${name} got ${formatDurationExact(mins)} of night sleep - right within the recommended ${rec.nightLo}-${rec.nightHi} hours of night sleep for ${pr.pos} age. Nice!`;
  if(hrs>=rec.nightLo-1) return `${name} got ${formatDurationExact(mins)} of night sleep - just under the recommended ${rec.nightLo}-${rec.nightHi} hours of night sleep. An earlier bedtime might help ${pr.obj} catch up.`;
  return `${name} got ${formatDurationExact(mins)} of night sleep. The recommended range for ${pr.pos} age is ${rec.nightLo}-${rec.nightHi} hours of night sleep. Consider adjusting ${pr.pos} bedtime routine.`;
}

function getNapEval(name,mins,napCount,ageMonths,pr){
  if(mins<=0) return null;
  const hrs=mins/60;const rec=getSleepRec(ageMonths);
  const perNapNote = rec.perNap ? ` At ${pr.pos} age, each nap is typically ${rec.perNap}.` : "";
  if(hrs>=rec.napLo&&hrs<=rec.napHi) return `${name} napped ${formatDurationExact(mins)} across ${napCount} nap${napCount!==1?"s":""} today - right on track! The recommended nap total for ${pr.pos} age is ${rec.napLo}-${rec.napHi} hours of nap sleep.${perNapNote}`;
  if(hrs>rec.napHi) return `${name} napped ${formatDurationExact(mins)} today - a bit above the recommended ${rec.napLo}-${rec.napHi} hours of nap sleep. Extra naps are fine occasionally, but long daytime sleep may affect night sleep.${perNapNote}`;
  if(hrs>=rec.napLo-0.5) return `${name} napped ${formatDurationExact(mins)} today - close to the recommended ${rec.napLo}-${rec.napHi} hours of nap sleep. ${pr.Sub}'s doing well!${perNapNote}`;
  return `${name} napped ${formatDurationExact(mins)} today. The recommended range is ${rec.napLo}-${rec.napHi} hours of nap sleep.${perNapNote} ${pr.Sub} may benefit from an additional nap or a quieter sleep environment.`;
}

const pronounSets = {
  girl: { sub:"she",Sub:"She",obj:"her",Obj:"Her",pos:"her",Pos:"Her",ref:"herself" },
  boy: { sub:"he",Sub:"He",obj:"him",Obj:"Him",pos:"his",Pos:"His",ref:"himself" }
};

function genderize(text, gender) {
  if(!gender||gender==="girl") return text;
  const p = pronounSets.boy;
  return text
    .replace(/\bShe's\b/g, p.Sub+"'s").replace(/\bshe's\b/g, p.sub+"'s")
    .replace(/\bShe\b/g, p.Sub).replace(/\bshe\b/g, p.sub)
    .replace(/\bHerself\b/g, "Himself").replace(/\bherself\b/g, "himself")
    .replace(/\bHer\b/g, p.Pos).replace(/\bher\b/g, p.pos);
}

const milestoneData=[
  {month:1,label:"1 Month",summary:"In the first month, your baby is adjusting to life outside the womb. She's beginning to focus on faces, respond to sounds, and develop the muscle strength to lift her head briefly.",categories:[
    {cat:"Movement/Physical",items:["Moves arms and legs actively","Lifts head briefly when on tummy","Strong reflex grip when you place finger in palm"]},
    {cat:"Social/Emotional",items:["Calms when held or hears your voice","Stares at faces up close","Adjusts body when held in your arms"]},
    {cat:"Language/Communication",items:["Cries to signal needs","Reacts to loud sounds by startling","Makes small throaty sounds"]},
    {cat:"Cognitive",items:["Focuses on objects 8-12 inches away","Prefers to look at faces and high-contrast patterns","Briefly tracks a moving object with eyes"]}]},
  {month:2,label:"2 Months",summary:"By two months, your baby is becoming more social - smiling at you, cooing, and tracking your movements. Tummy time is helping build neck and shoulder strength.",categories:[
    {cat:"Movement/Physical",items:["Holds head up when on tummy","Moves both arms and both legs","Opens hands briefly"]},
    {cat:"Social/Emotional",items:["Calms down when spoken to or picked up","Looks at your face","Smiles when you talk to or smile at her"]},
    {cat:"Language/Communication",items:["Makes sounds other than crying","Reacts to loud sounds","Coos with vowel-like sounds"]},
    {cat:"Cognitive",items:["Watches you as you move","Looks at a toy for several seconds","Begins to follow moving objects with eyes"]}]},
  {month:3,label:"3 Months",summary:"At three months, your baby is smiling more, starting to babble with vowel sounds, and gaining the strength to push up during tummy time.",categories:[
    {cat:"Movement/Physical",items:["Pushes up on arms during tummy time","Opens and shuts hands","Brings hands together to midline"]},
    {cat:"Social/Emotional",items:["Smiles spontaneously at people","Enjoys playing with others","Imitates some facial expressions"]},
    {cat:"Language/Communication",items:["Coos and babbles with vowel sounds","Turns head toward direction of sounds","Makes sounds back when you talk"]},
    {cat:"Cognitive",items:["Eyes track moving objects smoothly","Recognizes familiar people at a distance","Begins to coordinate hand and eye movements"]}]},
  {month:4,label:"4 Months",summary:"Four months brings a big leap - your baby chuckles, reaches for toys intentionally, and holds her head steady.",categories:[
    {cat:"Movement/Physical",items:["Holds head steady without support","Holds a toy when you put it in her hand","Pushes up onto elbows when on tummy"]},
    {cat:"Social/Emotional",items:["Smiles on her own to get your attention","Chuckles when you try to make her laugh","Makes sounds to get or keep your attention"]},
    {cat:"Language/Communication",items:["Makes cooing sounds like 'oooo' and 'aahh'","Makes sounds back when you talk to her","Turns head towards the sound of your voice"]},
    {cat:"Cognitive",items:["Opens mouth when she sees breast or bottle if hungry","Looks at her hands with interest","Uses arm to swing at toys"]}]},
  {month:5,label:"5 Months",summary:"At five months, your baby is likely rolling over, reaching for objects with purpose, and starting to bear weight on her legs when held upright.",categories:[
    {cat:"Movement/Physical",items:["Rolls from tummy to back","Reaches for and grasps toys","Bears weight on legs when held upright"]},
    {cat:"Social/Emotional",items:["Shows excitement by waving arms and legs","Enjoys looking at self in mirror","Responds differently to familiar vs. unfamiliar people"]},
    {cat:"Language/Communication",items:["Babbles with consonant sounds emerging","Responds to own name by looking","Expresses displeasure with sounds, not just crying"]},
    {cat:"Cognitive",items:["Explores objects by putting them in mouth","Reaches for objects that are partially hidden","Watches where a dropped object falls"]}]},
  {month:6,label:"6 Months",summary:"Six months is a major milestone age - your baby laughs, rolls, sits with support, and begins exploring everything by mouth.",categories:[
    {cat:"Movement/Physical",items:["Rolls from tummy to back","Pushes up with straight arms on tummy","Leans on hands to support herself when sitting"]},
    {cat:"Social/Emotional",items:["Knows familiar people","Likes to look at herself in a mirror","Laughs out loud"]},
    {cat:"Language/Communication",items:["Takes turns making sounds with you","Blows raspberries","Makes squealing noises"]},
    {cat:"Cognitive",items:["Puts things in her mouth to explore them","Reaches to grab a toy she wants","Closes lips to show she doesn't want more food"]}]},
  {month:7,label:"7 Months",summary:"By seven months, your baby sits without support for short periods, transfers objects between hands, and responds to emotions in your voice.",categories:[
    {cat:"Movement/Physical",items:["Sits without support for short periods","Supports whole weight on legs when standing with help","Transfers objects from one hand to the other"]},
    {cat:"Social/Emotional",items:["Enjoys social play and interaction","Responds to other people's expressions of emotion","Distinguishes emotions by tone of voice"]},
    {cat:"Language/Communication",items:["Babbles chains of consonants like 'babababa'","Uses voice to express joy and displeasure","Responds to own name consistently"]},
    {cat:"Cognitive",items:["Finds partially hidden objects","Explores objects with hands and mouth","Struggles to get objects that are out of reach"]}]},
  {month:8,label:"8 Months",summary:"At eight months, separation anxiety may appear - a sign of healthy attachment. Your baby is likely crawling or scooting and playing peek-a-boo.",categories:[
    {cat:"Movement/Physical",items:["Gets to sitting position independently","Crawls forward on belly or hands and knees","Picks up small objects with raking grasp"]},
    {cat:"Social/Emotional",items:["May be clingy with familiar adults","May show fear or anxiety around strangers","Plays interactive games like peek-a-boo"]},
    {cat:"Language/Communication",items:["Babbles with varied sounds like 'mamama' or 'bababa'","Gestures for 'up' by raising arms","Understands 'no' by pausing or stopping briefly"]},
    {cat:"Cognitive",items:["Looks for dropped or hidden objects","Bangs two objects together","Watches the path of a falling object"]}]},
  {month:9,label:"9 Months",summary:"Nine months is a recommended developmental screening age. Your baby shows clear emotions, understands object permanence, and may be pulling up to stand.",categories:[
    {cat:"Movement/Physical",items:["Gets to sitting position by herself","Moves things from one hand to the other","Sits without support"]},
    {cat:"Social/Emotional",items:["Is shy, clingy, or fearful around strangers","Shows several facial expressions (happy, sad, angry)","Smiles or laughs when you play peek-a-boo"]},
    {cat:"Language/Communication",items:["Makes different sounds like 'mamamama' and 'babababa'","Lifts arms up to be picked up","Looks when you call her name"]},
    {cat:"Cognitive",items:["Looks for objects when dropped out of sight","Bangs two things together","Uses fingers to rake food towards herself"]}]},
  {month:10,label:"10 Months",summary:"At ten months, your baby is cruising along furniture, developing a pincer grasp to pick up small items, and waving bye-bye.",categories:[
    {cat:"Movement/Physical",items:["Pulls to standing using furniture","Cruises along furniture holding on","Uses pincer grasp (thumb and finger) emerging"]},
    {cat:"Social/Emotional",items:["Waves bye-bye with prompting","Shows preference for certain toys","Seeks comfort from familiar caregivers when upset"]},
    {cat:"Language/Communication",items:["Says 'mama' or 'dada' non-specifically","Imitates speech sounds and simple gestures","Responds to simple verbal requests"]},
    {cat:"Cognitive",items:["Explores objects in varied ways (shaking, banging, throwing)","Begins to use objects correctly (drinks from cup, brushes hair)","Finds hidden objects easily"]}]},
  {month:11,label:"11 Months",summary:"Eleven months brings exciting firsts - your baby may stand alone briefly or take first steps. She says 'mama' or 'dada' with meaning.",categories:[
    {cat:"Movement/Physical",items:["Stands alone for a few seconds","May take first steps independently","Places objects into containers"]},
    {cat:"Social/Emotional",items:["Shows attachment to specific caregivers","Tests parental responses to behavior","Enjoys imitating people during play"]},
    {cat:"Language/Communication",items:["Says 'mama' or 'dada' with meaning","Tries to imitate words you say","Uses simple gestures like shaking head 'no'"]},
    {cat:"Cognitive",items:["Follows simple directions with gestures","Explores cause-and-effect with toys","Points to objects of interest"]}]},
  {month:12,label:"12 Months",summary:"Happy first birthday! Your baby likely walks holding furniture, uses a pincer grasp with precision, understands simple words, and plays interactive games.",categories:[
    {cat:"Movement/Physical",items:["Pulls up to stand","Walks holding on to furniture","Picks things up between thumb and pointer finger"]},
    {cat:"Social/Emotional",items:["Plays games with you like pat-a-cake","Waves bye-bye","Shows affection to familiar people"]},
    {cat:"Language/Communication",items:["Calls a parent 'mama' or 'dada' or special name","Understands 'no' (pauses or stops when you say it)","Responds to simple spoken requests"]},
    {cat:"Cognitive",items:["Puts something in a container like a block in a cup","Looks for things she sees you hide","Drinks from a cup without a lid as you hold it"]}]}
];

const educationData=[
  {id:"nutrition",title:"Feeding & Nutrition",icon:"\uD83C\uDF7C",preview:"Most formulas are cow's milk-based and iron-fortified. Always follow mixing instructions exactly.",articles:[
    {t:"Formula Feeding Basics",content:"Most formulas are cow's milk-based and iron-fortified. Always follow mixing instructions exactly - too concentrated risks dehydration, too dilute means inadequate nutrition. Prepared formula can be stored in the refrigerator up to 24 hours. Discard any formula left in the bottle after a feeding within 1 hour."},
    {t:"How Much Formula by Age",table:{headers:["Age","Per Feeding","Feedings/Day","Daily Total"],rows:[["0-1 mo","1-2 oz","8-12x","12-24 oz"],["1-2 mo","3-4 oz","6-8x","18-32 oz"],["3-4 mo","4-5 oz","5-6x","24-32 oz"],["5-6 mo","5-6 oz","4-5x","24-32 oz"],["7-12 mo","6-8 oz","3-4x","24-32 oz"]]},content:"Let baby guide - never force a finish. Total daily intake typically ranges from 24-32 oz."},
    {t:"Hunger & Fullness Cues",content:"Hunger signs: rooting, hand-to-mouth, lip smacking, fussiness. Fullness signs: turning away, closing mouth, slowing down, pushing bottle away. Crying is a late hunger sign. Responsive feeding supports healthy growth and self-regulation."},
    {t:"Introducing Solid Foods",content:"AAP recommends around 6 months when baby shows readiness: sits with support, good head control, opens mouth for spoon, shows interest in food. Start with single-ingredient purees. Wait 3-5 days between new foods. Early introduction of common allergens (peanut, egg) around 6 months may reduce allergy risk."},
    {t:"Water & Juice Guidelines",content:"No water needed before 6 months for formula-fed babies. After 6 months, small sips of water (2-4 oz daily) with meals. No juice before 12 months per AAP. Formula remains the primary nutrition source through the first year."}
  ]},
  {id:"sleep",title:"Sleep",icon:"\uD83D\uDE34",preview:"Always place baby on her back on a firm, flat surface. Nothing in the crib. Room-sharing (not bed-sharing) for at least 6 months.",articles:[
    {t:"Safe Sleep Practices",content:"Always place baby on her back on a firm, flat surface. Nothing in the crib - no blankets, pillows, bumper pads, stuffed animals, or loose bedding. Room-sharing (not bed-sharing) for at least 6 months, ideally 12 months. Use a sleep sack instead of blankets. Keep room temperature comfortable (68-72 F)."},
    {t:"Sleep Needs by Age",table:{headers:["Age","Total Sleep","Night","Naps","Per Nap"],rows:[["0-3 mo","14-17 hrs","8-9 hrs (in stretches)","3-5 naps","30 min-2 hrs"],["4-6 mo","12-16 hrs","10-11 hrs","2-3 naps","45 min-1.5 hrs"],["6-9 mo","12-16 hrs","10-12 hrs","2 naps","1-1.5 hrs"],["9-12 mo","12-16 hrs","10-12 hrs","1-2 naps","1-2 hrs"]]},content:"Most babies don't sleep through the night until 6+ months. Night stretches lengthen as baby matures."},
    {t:"Sleep Regressions",content:"4-month regression: sleep cycle maturation causes frequent waking. 8-10 month regression: separation anxiety and new motor skills disrupt sleep. Both are temporary (1-4 weeks). Maintain consistent routines and be patient."},
    {t:"Building a Bedtime Routine",content:"Start a consistent bedtime routine as early as 6-8 weeks. A simple sequence: dim lights, bath, feeding, book or song, into crib drowsy but awake. Keep it 20-30 minutes. Same order every night builds sleep associations."}
  ]},
  {id:"growthbody",title:"Growth & Body",icon:"\uD83D\uDCCF",preview:"WHO growth standards are used for 0-24 months. Percentiles compare your baby to others the same age.",articles:[
    {t:"Understanding Growth Charts",content:"WHO growth standards are used for 0-24 months per AAP recommendation. Percentiles compare your baby to others the same age - 50th percentile means average, not a target. What matters most is tracking consistently along a curve over time, not any single measurement."},
    {t:"Head Circumference",content:"Head circumference is measured at every well-child visit to monitor brain growth. Average newborn head is about 13.5 inches, growing roughly 2 cm/month in the first 3 months. It's one of the most important measurements in the first year."},
    {t:"Teething Timeline & Comfort",content:"First teeth typically appear around 6 months (lower central incisors). By 12 months, most babies have 2-4 teeth. Teething may cause fussiness, drooling, and gum rubbing - but does NOT cause fever or diarrhea. Soothe with chilled teething rings or gentle gum massage."},
    {t:"Diaper Output - What's Normal",content:"Newborns: 6+ wet diapers and 3-4 stools daily by day 4. Stool color and frequency vary widely. By 2+ months, some babies stool once daily or even less. Fewer than 6 wet diapers in 24 hours may signal dehydration - contact your pediatrician."}
  ]},
  {id:"devplay",title:"Development & Play",icon:"\uD83E\uDDF8",preview:"Start tummy time from day one with short sessions. The best toy at any age is an engaged caregiver.",articles:[
    {t:"Tummy Time Guide",content:"Start from day one with short sessions (3-5 minutes, 2-3 times daily). Build to 15-30+ minutes daily by 3 months. Tummy time strengthens neck, shoulders, and core - essential for rolling, crawling, and sitting."},
    {t:"Age-Appropriate Toys & Activities",content:"0-3 months: high-contrast images, soft rattles, gentle music. 3-6 months: soft books, teethers, play gym. 6-9 months: stacking cups, cause-and-effect toys, board books. 9-12 months: push toys, shape sorters, nesting containers. The best toy at any age is an engaged caregiver."},
    {t:"Screen Time Guidelines",content:"AAP recommends no screen time before 18-24 months, except video calling with family. Babies learn through face-to-face interaction, not screens. Background TV reduces the quality of parent-child interaction."},
    {t:"Talking & Reading to Baby",content:"Narrate your day, read picture books, sing songs - even to newborns. Respond to coos and babbles as if having a conversation. By 6 months, babies recognize frequently heard words. Reading 15 minutes daily has measurable impact on vocabulary."}
  ]},
  {id:"grandparent",title:"Grandparent Corner",icon:"\uD83D\uDC9D",preview:"Parenting guidance has changed significantly. Back to sleep (not tummy). No cereal in bottles. No honey before age 1.",articles:[
    {t:"What's Changed Since You Raised Kids",content:"Back to sleep (not tummy). No cereal in bottles. No honey before age 1 (botulism risk). Rear-facing car seats much longer (at least age 2). Solids delayed to around 6 months. No walkers. No bumper pads in cribs. Room-sharing recommended. Early allergen introduction is now encouraged."},
    {t:"Supporting New Parents",content:"Ask before giving advice - parenting guidance has changed significantly. Follow the parents' routines, rules, and feeding preferences. Offer practical help: cook a meal, do laundry, hold the baby while they nap. Respect that the parents are the decision-makers."},
    {t:"Bonding Activities for Grandparents",content:"Skin-to-skin holding strengthens bonding at any age. Read aloud - babies love the rhythm of a familiar voice. Sing songs, even if you think you can't sing. Gentle rocking and floor play during tummy time. Consistency builds secure attachment."}
  ]}
];

const resourcesData=[
  {name:"CDC Learn the Signs. Act Early.",desc:"Free milestone checklists, tracker app, and early intervention resources.",url:"https://www.cdc.gov/ActEarly"},
  {name:"CDC Milestone Tracker App",desc:"Free iOS and Android app for tracking developmental milestones.",url:"https://www.cdc.gov/act-early/milestones-app/index.html"},
  {name:"AAP HealthyChildren.org",desc:"Pediatrician-backed parenting guidance from the American Academy of Pediatrics.",url:"https://www.healthychildren.org"},
  {name:"WHO Child Growth Standards",desc:"International growth reference charts for children 0-5 years.",url:"https://www.who.int/tools/child-growth-standards"},
  {name:"Early Intervention Finder",desc:"Find your state's free developmental evaluation program.",url:"https://www.cdc.gov/FindEI"}
];

const DEEP_DIVE_MS=`You are BabyAdvisor, an evidence-based infant development guide. Generate personalized milestone guidance using EXACTLY this format:

**Where Baby Is Now**
2-3 sentences on what this milestone means at this specific age. Celebrate what's been achieved.

**Activities to Encourage Development**
2-3 sentences with specific, age-appropriate activities a caregiver can do today.

**When to Talk to Your Pediatrician**
1-2 sentences on what would warrant a conversation. Always reassuring. End with "every baby develops at her own pace."

Rules: Warm, family-friendly tone. No bullet points. No # headers. Use **bold** only for the three section titles. CDC/AAP guidelines only. Never diagnose.`;

const DEEP_DIVE_ED=`You are BabyAdvisor, an evidence-based infant care guide. Generate personalized guidance:

**For Baby at This Age**
2-3 sentences personalizing this topic to the baby's specific age and developmental stage.

**Practical Tips**
2-3 sentences with concrete, actionable steps to implement right away.

**Good to Know**
1-2 sentences with additional context or common misconceptions.

Rules: Warm, family-friendly tone. No bullet points. No # headers. **bold** only for titles. CDC/AAP/WHO only. Never diagnose.`;

const CHAT_SYS=`You are BabyAdvisor, an AI infant care advisor based on CDC, AAP, and WHO guidelines.
Every response starts with "Based on [baby name]'s age ([age]),"
Simple questions: 2-3 sentences. Deeper questions: brief intro, 3-4 **bold name:** recommendations, end with "**Tip:** [actionable step]"
Rules: Warm, family-friendly. Evidence-based only. Never diagnose. Redirect medical concerns to pediatrician. Under 200 words. No bullet points.`;

async function callAI(sys,msg,history){
  try{const messages=history?[...history,{role:"user",content:msg}]:[{role:"user",content:msg}];const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:sys,messages})});const d=await r.json();return d.content?.map(b=>b.text||"").join("\n")||"No response.";}catch{return"Unable to connect. Please try again.";}
}

function calcAge(bd){
  if(!bd)return{months:0,days:0,totalDays:0,label:"-"};
  const now=new Date(),b=new Date(bd+"T00:00:00"),diff=Math.floor((now-b)/864e5);
  if(diff<0)return{months:0,days:0,totalDays:0,label:"not yet born"};
  const m=Math.floor(diff/30.44),d=Math.floor(diff%30.44);
  return{months:m,days:d,totalDays:diff,label:m>0?`${m} month${m!==1?"s":""}, ${d} day${d!==1?"s":""}`:`${d} day${d!==1?"s":""}`};
}
function todayStr(){return new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});}
function nowTimeStr(){return new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:true});}
function getCurrentTimeFields(){const now=new Date();let h=now.getHours();const m=now.getMinutes();const ap=h>=12?"PM":"AM";if(h>12)h-=12;if(h===0)h=12;return{h:String(h),m:String(m).padStart(2,"0"),ap};}
function timeFieldsToMinutes(h,m,ap){if(!h)return null;let hr=parseInt(h)||0;const mn=parseInt(m)||0;if(ap==="PM"&&hr<12)hr+=12;if(ap==="AM"&&hr===12)hr=0;return hr*60+mn;}
function formatTimeFields(h,m,ap){return`${h||12}:${String(m||0).padStart(2,"0")} ${ap}`;}
function calcDurFromFields(sh,sm,sap,eh,em,eap){const s=timeFieldsToMinutes(sh,sm,sap),e=timeFieldsToMinutes(eh,em,eap);if(s==null||e==null)return 0;let d=e-s;if(d<0)d+=1440;return d;}
function formatDurationExact(mins){if(mins<=0)return"0 min";const h=Math.floor(mins/60),m=mins%60;if(h===0)return`${m} min`;if(m===0)return`${h} hr${h!==1?"s":""}`;return`${h} hr${h!==1?"s":""} ${m} min`;}

const KEYS={profile:"bt-profile",feeds:"bt-feeds",nightSleep:"bt-nightsleep",naps:"bt-naps",growth:"bt-growth",checks:"bt-checks"};
function sGet(k){try{const v=localStorage.getItem(k);return v?JSON.parse(v):null;}catch{return null;}}
function sSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){console.error(e);}}

const Spinner=()=><div style={{display:"flex",alignItems:"center",gap:8,padding:"12px 0"}}><div style={{width:16,height:16,border:"2px solid #ccc",borderTopColor:"currentColor",borderRadius:"50%",animation:"spin .8s linear infinite"}}/><span style={{fontSize:".84rem",color:C.sec}}>Generating...</span></div>;

const navSections=[
  {id:"tracker",label:"Tracker",icon:"tracker"},
  {id:"growth",label:"Growth",icon:"growth"},
  {id:"milestones",label:"Milestones",icon:"milestones"},
  {id:"summary",label:"Summary",icon:"summary"},
  {id:"education",label:"Education",icon:"education"},
  {id:"resources",label:"Resources",icon:"resources"}
];

const HEADER_H=110;

function TimeInput({h,m,ap,onH,onM,onAP,mid}){
  const fw=52;
  return(
    <div style={{display:"flex",alignItems:"center",gap:4}}>
      <input placeholder="Hr" value={h} onChange={e=>{const v=e.target.value.replace(/\D/g,"");if(v===""||(/^\d{1,2}$/.test(v)&&parseInt(v)<=12))onH(v);}} style={{width:fw,padding:"8px 4px",border:"1.5px solid "+(mid),borderRadius:8,fontSize:".85rem",outline:"none",textAlign:"center"}}/>
      <span style={{color:"#bbb",fontWeight:600}}>:</span>
      <input placeholder="Min" value={m} onChange={e=>{const v=e.target.value.replace(/\D/g,"");if(v===""||(/^\d{1,2}$/.test(v)&&parseInt(v)<=59))onM(v);}} style={{width:fw,padding:"8px 4px",border:"1.5px solid "+(mid),borderRadius:8,fontSize:".85rem",outline:"none",textAlign:"center"}}/>
      <div style={{display:"flex",borderRadius:6,overflow:"hidden",border:"1.5px solid "+(mid)}}>
        <button onClick={()=>onAP("AM")} style={{padding:"7px 8px",fontSize:".74rem",fontWeight:600,background:ap==="AM"?"#eee":"#fff",border:"none",cursor:"pointer",color:ap==="AM"?C.h:"#bbb"}}>AM</button>
        <button onClick={()=>onAP("PM")} style={{padding:"7px 8px",fontSize:".74rem",fontWeight:600,background:ap==="PM"?"#eee":"#fff",border:"none",cursor:"pointer",color:ap==="PM"?C.h:"#bbb",borderLeft:"1px solid "+(mid)}}>PM</button>
      </div>
    </div>
  );
}

function getMilestoneEval(name,count,total,pr){
  const pct=Math.round((count/total)*100);
  if(count===0)return"Start tracking "+name+"'s development by checking off the milestones below as "+pr.sub+" achieves them. Every baby develops on "+pr.pos+" own timeline!";
  if(pct===100)return name+" has achieved all "+total+" milestones (100%) for this month - amazing progress! "+pr.Sub+"'s hitting every developmental marker. Keep up the wonderful interactions and play.";
  if(pct>=75)return name+" has achieved "+count+" of "+total+" milestones ("+pct+"%) - doing wonderfully! "+pr.Sub+"'s showing strong development across areas. Keep engaging with "+pr.obj+" through play, reading, and conversation.";
  if(pct>=50)return name+" has achieved "+count+" of "+total+" milestones ("+pct+"%) - making good progress! Some milestones take a little more time, and that's perfectly normal. Continue with tummy time, talking, and interactive play.";
  return name+" has achieved "+count+" of "+total+" milestones ("+pct+"%). Every baby develops on "+pr.pos+" own timeline. Keep providing loving interaction, tummy time, and conversation. If you have concerns, your pediatrician is always a great resource.";
}

function MonthlySummarySection({ feeds, nightSleep, naps, growthEntries, profile, age, t, sectionRef }){
  var monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  var birthDate = profile.birthDate ? new Date(profile.birthDate+"T00:00:00") : new Date();
  var startYear = birthDate.getFullYear();
  var startMo = birthDate.getMonth();
  var nowDate = new Date();
  var nowYear = nowDate.getFullYear();
  var nowMo = nowDate.getMonth();

  var months = [];
  var y = startYear, m = startMo;
  while(y < nowYear || (y === nowYear && m <= nowMo)){
    months.push({year:y,month:m});
    m++;
    if(m>11){m=0;y++;}
  }

  var initIdx = months.length - 1;
  var [selIdx, setSelIdx] = useState(initIdx);
  var sel = months[selIdx] || months[months.length-1];
  var selLabel = monthNames[sel.month] + " " + sel.year;

  function isInMonth(dateStr, yr, mo){
    var d = new Date(dateStr);
    return d.getFullYear() === yr && d.getMonth() === mo;
  }

  var mFeeds = feeds.filter(function(f){ return isInMonth(f.date,sel.year,sel.month); });
  var mNights = nightSleep.filter(function(s){ return isInMonth(s.date,sel.year,sel.month); });
  var mNaps = naps.filter(function(n){ return isInMonth(n.date,sel.year,sel.month); });
  var mGrowth = growthEntries.filter(function(g){ return isInMonth(g.date,sel.year,sel.month); });

  var allDatesSet = new Set();
  mFeeds.forEach(function(f){ allDatesSet.add(f.date); });
  mNights.forEach(function(s){ allDatesSet.add(s.date); });
  mNaps.forEach(function(n){ allDatesSet.add(n.date); });
  var allDates = Array.from(allDatesSet).sort(function(a, b){ return new Date(a) - new Date(b); });

  var fsRows = allDates.map(function(date){
    var dayFeeds = mFeeds.filter(function(f){ return f.date === date; });
    var dayNights = mNights.filter(function(s){ return s.date === date; });
    var dayNaps = mNaps.filter(function(n){ return n.date === date; });
    var totalOz = dayFeeds.reduce(function(s, f){ return s + f.oz; }, 0);
    var nightMins = dayNights.reduce(function(s, n){ return s + (n.durMins || 0); }, 0);
    var napMins = dayNaps.reduce(function(s, n){ return s + (n.durMins || 0); }, 0);
    var totalSleepMins = nightMins + napMins;
    return {
      date: date,
      feeding: dayFeeds.length > 0 ? dayFeeds.length + " feed" + (dayFeeds.length !== 1 ? "s" : "") + " / " + totalOz + " oz" : null,
      night: nightMins > 0 ? formatDurationExact(nightMins) : null,
      naps: dayNaps.length > 0 ? formatDurationExact(napMins) + " (" + dayNaps.length + ")" : null,
      totalSleep: totalSleepMins > 0 ? formatDurationExact(totalSleepMins) : null,
    };
  });

  var gRows = mGrowth.slice().sort(function(a, b){ return new Date(a.date) - new Date(b.date); });

  var totalFeedCount = mFeeds.length;
  var totalOzAll = mFeeds.reduce(function(s,f){ return s + f.oz; }, 0);
  var totalNightMins = mNights.reduce(function(s,n){ return s + (n.durMins||0); }, 0);
  var totalNapMins = mNaps.reduce(function(s,n){ return s + (n.durMins||0); }, 0);
  var daysTracked = allDates.length;
  var avgOzPerDay = daysTracked > 0 ? (totalOzAll / daysTracked).toFixed(1) : "0";
  var avgSleepPerDay = daysTracked > 0 ? formatDurationExact(Math.round((totalNightMins + totalNapMins) / daysTracked)) : "0 min";

  var canPrev = selIdx > 0;
  var canNext = selIdx < months.length - 1;

  var cs = {padding:"10px 14px",fontSize:".82rem",color:C.body,borderBottom:"1px solid #f0f0f0"};
  var ths = {padding:"10px 14px",fontSize:".72rem",fontWeight:700,color:C.sec,textTransform:"uppercase",letterSpacing:".05em",borderBottom:"2px solid "+(t.mid),textAlign:"left",whiteSpace:"nowrap"};
  var dash = <span style={{color:"#ccc"}}>&mdash;</span>;

  var arrowStyle = function(enabled){ return {width:34,height:34,borderRadius:8,border:"1.5px solid "+(enabled?t.mid:"#eee"),background:enabled?"#fff":"#fafafa",cursor:enabled?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",opacity:enabled?1:0.35}; };

  return (
    <div ref={sectionRef} data-sec="summary" style={{marginBottom:36,scrollMarginTop:HEADER_H}}>
      <div style={{fontSize:"1.05rem",fontWeight:600,color:t.pri,marginBottom:14,display:"flex",alignItems:"center",gap:8}}><NavIcon type="summary" color={t.pri}/> Summary</div>

      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
        <button onClick={function(){if(canPrev)setSelIdx(selIdx-1);}} disabled={!canPrev} style={arrowStyle(canPrev)}>
          <svg viewBox="0 0 24 24" style={{width:16,height:16,stroke:canPrev?t.pri:"#bbb",fill:"none",strokeWidth:2.5,strokeLinecap:"round",strokeLinejoin:"round"}}><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style={{fontSize:"1rem",fontWeight:700,color:C.h,minWidth:180,textAlign:"center"}}>{selLabel}</div>
        <button onClick={function(){if(canNext)setSelIdx(selIdx+1);}} disabled={!canNext} style={arrowStyle(canNext)}>
          <svg viewBox="0 0 24 24" style={{width:16,height:16,stroke:canNext?t.pri:"#bbb",fill:"none",strokeWidth:2.5,strokeLinecap:"round",strokeLinejoin:"round"}}><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:20}}>
        {[
          {label:"Days Tracked",value:daysTracked,icon:"\uD83D\uDCC5"},
          {label:"Total Feeds",value:totalFeedCount,icon:"\uD83C\uDF7C"},
          {label:"Avg Intake / Day",value:avgOzPerDay+" oz",icon:"\uD83D\uDCCA"},
          {label:"Avg Sleep / Day",value:avgSleepPerDay,icon:"\uD83D\uDE34"}
        ].map(function(st,i){
          return(
            <div key={i} style={{flex:"1 1 150px",background:"#fff",borderRadius:12,padding:"14px 16px",boxShadow:"0 2px 8px rgba(0,0,0,.05)",minWidth:130}}>
              <div style={{fontSize:".72rem",fontWeight:600,color:C.sec,textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>{st.icon} {st.label}</div>
              <div style={{fontSize:"1.15rem",fontWeight:700,color:t.pri}}>{st.value}</div>
            </div>
          );
        })}
      </div>

      <div style={{background:"#fff",borderRadius:12,padding:"18px 20px",boxShadow:"0 2px 6px rgba(0,0,0,.05)",marginBottom:16}}>
        <div style={{fontSize:".9rem",fontWeight:700,color:C.h,marginBottom:14}}>Feeding & Sleep Log</div>
        {fsRows.length === 0 ? (
          <div style={{fontSize:".84rem",color:C.help,fontStyle:"italic",padding:"16px 0",textAlign:"center"}}>No feeding or sleep data for {selLabel}.</div>
        ) : (
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:540}}>
              <thead>
                <tr style={{background:t.lt}}>
                  <th style={ths}>Date</th>
                  <th style={ths}>Feeding</th>
                  <th style={ths}>Night Sleep</th>
                  <th style={ths}>Naps</th>
                  <th style={ths}>Total Sleep</th>
                </tr>
              </thead>
              <tbody>
                {fsRows.map(function(r, i){
                  return(
                    <tr key={r.date} style={{background: i % 2 === 0 ? "#fff" : t.lt}}>
                      <td style={Object.assign({},cs,{fontWeight:600,whiteSpace:"nowrap",color:C.h})}>{r.date}</td>
                      <td style={cs}>{r.feeding || dash}</td>
                      <td style={cs}>{r.night || dash}</td>
                      <td style={cs}>{r.naps || dash}</td>
                      <td style={Object.assign({},cs,{fontWeight:r.totalSleep ? 600 : 400,color:r.totalSleep ? t.pri : "#ccc"})}>{r.totalSleep || dash}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{background:"#fff",borderRadius:12,padding:"18px 20px",boxShadow:"0 2px 6px rgba(0,0,0,.05)"}}>
        <div style={{fontSize:".9rem",fontWeight:700,color:C.h,marginBottom:14}}>Growth Record</div>
        {gRows.length === 0 ? (
          <div style={{fontSize:".84rem",color:C.help,fontStyle:"italic",padding:"16px 0",textAlign:"center"}}>No growth entries for {selLabel}.</div>
        ) : (
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:340}}>
              <thead>
                <tr style={{background:t.lt}}>
                  <th style={ths}>Date</th>
                  <th style={ths}>Weight (lbs)</th>
                  <th style={ths}>Length (in)</th>
                </tr>
              </thead>
              <tbody>
                {gRows.map(function(g, i){
                  return(
                    <tr key={g.id} style={{background: i % 2 === 0 ? "#fff" : t.lt}}>
                      <td style={Object.assign({},cs,{fontWeight:600,whiteSpace:"nowrap",color:C.h})}>{g.date}</td>
                      <td style={cs}>{g.weight != null ? <span style={{fontWeight:600}}>{g.weight}</span> : dash}</td>
                      <td style={cs}>{g.length != null ? <span style={{fontWeight:600}}>{g.length}</span> : dash}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BabyTracker(){
  const[theme,setTheme]=useState("pink");
  const[profile,setProfile]=useState({name:"Erin",birthDate:"2024-11-05",gender:"girl",setupDone:false});
  const[feeds,setFeeds]=useState([]);
  const[nightSleep,setNightSleep]=useState([]);
  const[naps,setNaps]=useState([]);
  const[growthEntries,setGrowthEntries]=useState([]);
  const[milestoneChecks,setMilestoneChecks]=useState({});
  const[activeNav,setActiveNav]=useState("tracker");
  const[settingsOpen,setSettingsOpen]=useState(false);
  const[drawerOpen,setDrawerOpen]=useState(false);
  const[chatOpen,setChatOpen]=useState(false);
  const[loaded,setLoaded]=useState(false);
  const[feedOz,setFeedOz]=useState("");
  const[feedBrand,setFeedBrand]=useState("");
  const[feedNote,setFeedNote]=useState("");
  const[feedH,setFeedH]=useState("");
  const[feedM,setFeedM]=useState("");
  const[feedAP,setFeedAP]=useState("AM");
  const[nsH1,setNsH1]=useState("");const[nsM1,setNsM1]=useState("");const[nsAP1,setNsAP1]=useState("PM");
  const[nsH2,setNsH2]=useState("");const[nsM2,setNsM2]=useState("");const[nsAP2,setNsAP2]=useState("AM");
  const[napH1,setNapH1]=useState("");const[napM1,setNapM1]=useState("");const[napAP1,setNapAP1]=useState("AM");
  const[napH2,setNapH2]=useState("");const[napM2,setNapM2]=useState("");const[napAP2,setNapAP2]=useState("PM");
  const[gW,setGW]=useState("");const[gL,setGL]=useState("");
  const[openMonth,setOpenMonth]=useState(null);
  const[openEdu,setOpenEdu]=useState(null);
  const[diveLoading,setDiveLoading]=useState(null);
  const[diveResults,setDiveResults]=useState({});
  const[chatMsgs,setChatMsgs]=useState([]);
  const[chatInput,setChatInput]=useState("");
  const[chatLoading,setChatLoading]=useState(false);
  const[summaryOpen,setSummaryOpen]=useState(false);
  const chatEndRef=useRef(null);const chatInputRef=useRef(null);const sectionRefs=useRef({});const monthRefs=useRef({});const eduRefs=useRef({});
  const t=themes[theme]||themes.pink;
  const age=calcAge(profile.birthDate);
  const currentMonth=Math.min(Math.max(age.months,1),12);
  const gender=profile.gender||"girl";
  const pr=pronounSets[gender]||pronounSets.girl;

  useEffect(function(){
    const p=sGet(KEYS.profile);if(p){setProfile(p);if(p.theme)setTheme(p.theme);}
    const f=sGet(KEYS.feeds);if(f)setFeeds(f);
    const ns=sGet(KEYS.nightSleep);if(ns)setNightSleep(ns);
    const np=sGet(KEYS.naps);if(np)setNaps(np);
    const g=sGet(KEYS.growth);if(g)setGrowthEntries(g);
    const c=sGet(KEYS.checks);if(c)setMilestoneChecks(c);
    setLoaded(true);
  },[]);

  useEffect(function(){if(loaded)sSet(KEYS.feeds,feeds);},[feeds,loaded]);
  useEffect(function(){if(loaded)sSet(KEYS.nightSleep,nightSleep);},[nightSleep,loaded]);
  useEffect(function(){if(loaded)sSet(KEYS.naps,naps);},[naps,loaded]);
  useEffect(function(){if(loaded)sSet(KEYS.growth,growthEntries);},[growthEntries,loaded]);
  useEffect(function(){if(loaded)sSet(KEYS.checks,milestoneChecks);},[milestoneChecks,loaded]);
  useEffect(function(){if(loaded)setOpenMonth(currentMonth);},[loaded,currentMonth]);

  var setFeedTimeNow = function(){
    var ct = getCurrentTimeFields();
    setFeedH(ct.h); setFeedM(ct.m); setFeedAP(ct.ap);
  };

  var saveProf=function(p){var np=Object.assign({},p,{theme:theme});setProfile(np);sSet(KEYS.profile,np);};
  var addFeed=function(){if(!feedOz)return;var timeStr=feedH?formatTimeFields(feedH,feedM,feedAP):nowTimeStr();setFeeds(function(pv){return[{id:Date.now(),time:timeStr,date:new Date().toLocaleDateString(),oz:parseFloat(feedOz),brand:feedBrand,note:feedNote}].concat(pv);});setFeedOz("");setFeedBrand("");setFeedNote("");setFeedH("");setFeedM("");};
  var delFeed=function(id){setFeeds(function(pv){return pv.filter(function(f){return f.id!==id;});});};
  var addNight=function(){if(!nsH1||!nsH2)return;var st=formatTimeFields(nsH1,nsM1,nsAP1),en=formatTimeFields(nsH2,nsM2,nsAP2);var dur=calcDurFromFields(nsH1,nsM1,nsAP1,nsH2,nsM2,nsAP2);setNightSleep(function(pv){return[{id:Date.now(),date:new Date().toLocaleDateString(),start:st,end:en,durMins:dur}].concat(pv);});setNsH1("");setNsM1("");setNsH2("");setNsM2("");};
  var delNight=function(id){setNightSleep(function(pv){return pv.filter(function(s){return s.id!==id;});});};
  var addNap=function(){if(!napH1||!napH2)return;var st=formatTimeFields(napH1,napM1,napAP1),en=formatTimeFields(napH2,napM2,napAP2);var dur=calcDurFromFields(napH1,napM1,napAP1,napH2,napM2,napAP2);setNaps(function(pv){return[{id:Date.now(),date:new Date().toLocaleDateString(),start:st,end:en,durMins:dur}].concat(pv);});setNapH1("");setNapM1("");setNapH2("");setNapM2("");};
  var delNap=function(id){setNaps(function(pv){return pv.filter(function(s){return s.id!==id;});});};
  var addGrowth=function(){if(!gW&&!gL)return;setGrowthEntries(function(pv){return[{id:Date.now(),date:new Date().toLocaleDateString(),weight:gW?parseFloat(gW):null,length:gL?parseFloat(gL):null,ageMonths:age.months}].concat(pv);});setGW("");setGL("");};

  var toggleCheck=function(mo,cat,idx){var k=mo+"-"+cat+"-"+idx;setMilestoneChecks(function(pv){var n=Object.assign({},pv);n[k]=n[k]?null:new Date().toLocaleDateString();return n;});};
  var getMonthCount=function(mo){var c=0;var md=milestoneData.find(function(m){return m.month===mo;});if(!md)return 0;md.categories.forEach(function(cat){cat.items.forEach(function(_,i){if(milestoneChecks[mo+"-"+cat.cat+"-"+i])c++;});});return c;};
  var getMonthTotal=function(mo){var md=milestoneData.find(function(m){return m.month===mo;});if(!md)return 0;return md.categories.reduce(function(s,c){return s+c.items.length;},0);};
  var getCatCount=function(mo,cn){var c=0;var md=milestoneData.find(function(m){return m.month===mo;});if(!md)return 0;var cat=md.categories.find(function(ct){return ct.cat===cn;});if(!cat)return 0;cat.items.forEach(function(_,i){if(milestoneChecks[mo+"-"+cn+"-"+i])c++;});return c;};

  var scrollToRef=function(ref){setTimeout(function(){if(ref){var top=ref.getBoundingClientRect().top+window.scrollY-HEADER_H-4;window.scrollTo({top:top,behavior:"smooth"});}},50);};
  var handleMonthToggle=function(mo){if(openMonth===mo){setOpenMonth(null);return;}setOpenMonth(mo);scrollToRef(monthRefs.current[mo]);};
  var handleEduToggle=function(id){if(openEdu===id){setOpenEdu(null);return;}setOpenEdu(id);scrollToRef(eduRefs.current[id]);};

  var doDive=async function(type,key,ctx){if(diveResults[key]){setDiveResults(function(pv){var n=Object.assign({},pv);delete n[key];return n;});return;}setDiveLoading(key);var sys=type==="milestone"?DEEP_DIVE_MS:DEEP_DIVE_ED;var gp=gender==="boy"?"Use he/him pronouns for baby.":"Use she/her pronouns for baby.";var r=await callAI(sys+"\n"+gp,"Baby: "+profile.name+", "+age.label+" old.\n\n"+ctx);setDiveResults(function(pv){var n=Object.assign({},pv);n[key]=r;return n;});setDiveLoading(null);};

  useEffect(function(){if(chatEndRef.current)chatEndRef.current.scrollIntoView({behavior:"smooth"});},[chatMsgs,chatLoading]);
  useEffect(function(){if(chatOpen){setChatMsgs([]);setChatInput("");setTimeout(function(){if(chatInputRef.current)chatInputRef.current.focus();},100);}},[chatOpen]);
  var sendChat=async function(){if(!chatInput.trim()||chatLoading)return;var msg=chatInput.trim();setChatInput("");setChatMsgs(function(pv){return pv.concat([{role:"user",text:msg}]);});setChatLoading(true);var ctx="Baby: "+profile.name+", "+age.label+" old ("+currentMonth+" months).";var gp=gender==="boy"?"Use he/him pronouns.":"Use she/her pronouns.";var sys=CHAT_SYS+"\n"+gp+"\n\n"+ctx;var hist=chatMsgs.slice(-6).map(function(m){return{role:m.role==="user"?"user":"assistant",content:m.text};});var r=await callAI(sys,msg,hist);setChatMsgs(function(pv){return pv.concat([{role:"assistant",text:r}]);});setChatLoading(false);};

  var renderBold=function(text){var parts=text.split(/\*\*([^*]+)\*\*/g);return parts.map(function(pt,i){return i%2===1?<strong key={i} style={{color:t.pri}}>{pt}</strong>:<span key={i}>{pt}</span>;});};
  var navClick=function(sec){setActiveNav(sec);setDrawerOpen(false);var el=sectionRefs.current[sec];if(el){var top=el.getBoundingClientRect().top+window.scrollY-HEADER_H;window.scrollTo({top:top,behavior:"smooth"});}};

  useEffect(function(){var timer=setTimeout(function(){var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting)setActiveNav(e.target.dataset.sec);});},{threshold:.15,rootMargin:"-15% 0px -75% 0px"});navSections.forEach(function(s){var el=sectionRefs.current[s.id];if(el)obs.observe(el);});return function(){obs.disconnect();};},150);return function(){clearTimeout(timer);};},[]);

  var todayFeeds=feeds.filter(function(f){return f.date===new Date().toLocaleDateString();});
  var todayOz=todayFeeds.reduce(function(s,f){return s+f.oz;},0);
  var todayNights=nightSleep.filter(function(s){return s.date===new Date().toLocaleDateString();});
  var todayNaps=naps.filter(function(s){return s.date===new Date().toLocaleDateString();});
  var todayNightMins=todayNights.reduce(function(s,n){return s+(n.durMins||0);},0);
  var todayNapMins=todayNaps.reduce(function(s,n){return s+(n.durMins||0);},0);
  var nightEval=getNightEval(profile.name,todayNightMins,age.months,pr);
  var napEval=getNapEval(profile.name,todayNapMins,todayNaps.length,age.months,pr);

  var Badge=function(props){return props.count>0?<span style={{background:t.badge,color:t.badgeTxt,borderRadius:12,padding:"2px 8px",fontSize:".72rem",fontWeight:700,marginLeft:6}}>{props.count}</span>:null;};

  if(loaded&&!profile.setupDone){
    return(
      <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",background:"#fafafa",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
        <div style={{background:"#fff",borderRadius:16,padding:"36px 32px",maxWidth:400,width:"100%",boxShadow:"0 4px 20px rgba(0,0,0,.08)"}}>
          <div style={{fontSize:"1.3rem",fontWeight:800,color:BRAND,marginBottom:2}}>BabyTracker</div>
          <div style={{fontSize:".82rem",color:C.sec,marginBottom:28}}>Every Milestone Matters</div>
          <div style={{fontSize:".78rem",fontWeight:600,color:C.sec,textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>Name</div>
          <input value={profile.name} onChange={function(e){setProfile(function(pv){return Object.assign({},pv,{name:e.target.value});});}} style={{width:"100%",padding:"10px 14px",border:"1.5px solid #ddd",borderRadius:8,fontSize:".92rem",marginBottom:16,outline:"none",boxSizing:"border-box"}}/>
          <div style={{fontSize:".78rem",fontWeight:600,color:C.sec,textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>Gender</div>
          <div style={{display:"flex",gap:10,marginBottom:16}}>
            {["girl","boy"].map(function(g){var gc=g==="girl"?"#d4899e":"#6a9fd8";var glc=g==="girl"?"#fefafb":"#f5f9fd";var sel=(profile.gender||"girl")===g;return(
              <button key={g} onClick={function(){setProfile(function(pv){return Object.assign({},pv,{gender:g});});}} style={{flex:1,padding:"10px 0",borderRadius:10,border:sel?"2px solid "+gc:"2px solid #e0e0e0",background:sel?glc:"#fff",color:sel?gc:"#999",fontWeight:600,fontSize:".92rem",cursor:"pointer",transition:"all .15s",textTransform:"capitalize"}}>{g}</button>
            );})}
          </div>
          <div style={{fontSize:".78rem",fontWeight:600,color:C.sec,textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>Birth Date</div>
          <input type="date" value={profile.birthDate} onChange={function(e){setProfile(function(pv){return Object.assign({},pv,{birthDate:e.target.value});});}} style={{width:"100%",padding:"10px 14px",border:"1.5px solid #ddd",borderRadius:8,fontSize:".92rem",marginBottom:6,outline:"none",boxSizing:"border-box"}}/>
          {profile.birthDate&&<div style={{fontSize:".8rem",color:themes[theme].pri,fontWeight:600,marginBottom:16}}>{calcAge(profile.birthDate).label} old</div>}
          <div style={{fontSize:".78rem",fontWeight:600,color:C.sec,textTransform:"uppercase",letterSpacing:".06em",marginBottom:10}}>Theme Color</div>
          <div style={{display:"flex",gap:14,marginBottom:28}}>
            {themeColors.map(function(k){return <div key={k} onClick={function(){setTheme(k);}} style={{width:32,height:32,borderRadius:"50%",background:themes[k].pri,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{theme===k&&<span style={{color:"#fff",fontSize:".75rem",fontWeight:800}}>&#10003;</span>}</div>;})}
          </div>
          <button onClick={function(){saveProf(Object.assign({},profile,{setupDone:true,theme:theme}));}} disabled={!profile.name||!profile.birthDate} style={{width:"100%",background:profile.name&&profile.birthDate?BRAND:"#ccc",color:"#fff",border:"none",padding:"12px",borderRadius:8,fontSize:".95rem",fontWeight:700,cursor:profile.name&&profile.birthDate?"pointer":"not-allowed"}}>Get Started</button>
        </div>
      </div>
    );
  }

  if(!loaded)return <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",color:C.sec}}>Loading...</div>;

  var SettingsPopover=function(){
    if(!settingsOpen)return null;
    return(
    <div style={{position:"absolute",right:0,top:42,background:"#fff",border:"1px solid #e8e8e8",borderRadius:12,padding:"16px 18px",boxShadow:"0 6px 24px rgba(0,0,0,.12)",zIndex:200,width:260}} onClick={function(e){e.stopPropagation();}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:".78rem",color:C.h,fontWeight:700}}>Settings</div>
        <button onClick={function(e){e.stopPropagation();setSettingsOpen(false);}} style={{width:24,height:24,borderRadius:6,background:"none",border:"1.5px solid "+(t.mid),cursor:"pointer",fontSize:".75rem",color:t.pri,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>&#10005;</button>
      </div>
      <div style={{fontSize:".7rem",color:C.sec,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>Baby Profile</div>
      <div style={{fontSize:".72rem",fontWeight:600,color:C.sec,marginBottom:4}}>Name</div>
      <input value={profile.name} onChange={function(e){var np=Object.assign({},profile,{name:e.target.value});setProfile(np);sSet(KEYS.profile,Object.assign({},np,{theme:theme}));}} style={{width:"100%",padding:"7px 10px",border:"1.5px solid #ddd",borderRadius:6,fontSize:".85rem",outline:"none",marginBottom:10,boxSizing:"border-box"}}/>
      <div style={{fontSize:".72rem",fontWeight:600,color:C.sec,marginBottom:4}}>Gender</div>
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        {["girl","boy"].map(function(g){var gc=g==="girl"?"#d4899e":"#6a9fd8";var glc=g==="girl"?"#fefafb":"#f5f9fd";var sel=(profile.gender||"girl")===g;return(
          <button key={g} onClick={function(){var np=Object.assign({},profile,{gender:g});setProfile(np);sSet(KEYS.profile,Object.assign({},np,{theme:theme}));}} style={{flex:1,padding:"7px 0",borderRadius:8,border:sel?"2px solid "+gc:"2px solid #e0e0e0",background:sel?glc:"#fff",color:sel?gc:"#999",fontWeight:600,fontSize:".82rem",cursor:"pointer",transition:"all .15s",textTransform:"capitalize"}}>{g}</button>
        );})}
      </div>
      <div style={{fontSize:".72rem",fontWeight:600,color:C.sec,marginBottom:4}}>Birth Date</div>
      <input type="date" value={profile.birthDate} onChange={function(e){var np=Object.assign({},profile,{birthDate:e.target.value});setProfile(np);sSet(KEYS.profile,Object.assign({},np,{theme:theme}));}} style={{width:"100%",padding:"7px 10px",border:"1.5px solid #ddd",borderRadius:6,fontSize:".85rem",outline:"none",boxSizing:"border-box"}}/>
      <div style={{fontSize:".78rem",color:t.pri,fontWeight:600,marginTop:6,marginBottom:14}}>{age.label} old</div>
      <div style={{fontSize:".7rem",color:C.sec,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Theme Color</div>
      <div style={{display:"flex",gap:12}}>
        {themeColors.map(function(k){return <div key={k} onClick={function(){setTheme(k);saveProf(Object.assign({},profile,{theme:k}));}} style={{width:28,height:28,borderRadius:"50%",background:themes[k].pri,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{theme===k&&<span style={{color:"#fff",fontSize:".65rem",fontWeight:800}}>&#10003;</span>}</div>;})}
      </div>
    </div>);
  };

  var NavItems=function(props){
    var onExtra = props.onExtra;
    return(
    <>
      {navSections.map(function(s){return(
        <div key={s.id} onClick={function(){navClick(s.id);if(onExtra)onExtra();}} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 16px",fontSize:".87rem",color:activeNav===s.id?t.pri:C.sec,cursor:"pointer",fontWeight:activeNav===s.id?700:400,borderLeft:activeNav===s.id?"3px solid "+(t.pri):"3px solid transparent"}}>
          <NavIcon type={s.icon} color={activeNav===s.id?t.pri:C.sec}/>{s.label}
        </div>
      );})}
      <div style={{height:48}}/>
      <div onClick={function(){setChatOpen(true);if(onExtra)onExtra();}} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 16px",fontSize:".82rem",color:t.learn,cursor:"pointer",fontWeight:600}}>
        <NavIcon type="chat" color={t.learn}/> Ask BabyAdvisor
      </div>
    </>
  );};

  var DataTable=function(props){return(
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:".82rem",margin:"12px 0"}}>
      <thead><tr>{props.headers.map(function(h,i){return <th key={i} style={{textAlign:"left",padding:"8px 10px",borderBottom:"2px solid "+(t.mid),color:C.body,fontWeight:700,fontSize:".75rem",textTransform:"uppercase",letterSpacing:".04em"}}>{h}</th>;})}</tr></thead>
      <tbody>{props.rows.map(function(row,ri){return <tr key={ri}>{row.map(function(cell,ci){return <td key={ci} style={{padding:"7px 10px",borderBottom:"1px solid #f0f0f0",color:C.body}}>{cell}</td>;})}</tr>;})}</tbody>
    </table>
  );};

  return(
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",background:"#fff",minHeight:"100vh",color:C.body}}>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}} @media(max-width:768px){.btNavD{display:none!important}.btHam{display:flex!important}} input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0} input[type=number]{-moz-appearance:textfield;}"}</style>

      {summaryOpen && <MonthlySummaryPage feeds={feeds} nightSleep={nightSleep} naps={naps} growthEntries={growthEntries} profile={profile} age={age} onClose={function(){setSummaryOpen(false);}} t={t} />}

      <header style={{background:"#fff",borderBottom:"1px solid #e8eeec",padding:"12px 24px",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:"1.1rem",fontWeight:800,color:BRAND}}>BabyTracker <span style={{fontWeight:400,fontSize:".88rem",color:C.sec}}>Every Milestone Matters</span></div>
            <div style={{fontSize:".78rem",color:C.sec,marginTop:1}}>{todayStr()}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{position:"relative"}}>
              <button onClick={function(){setSettingsOpen(!settingsOpen);}} style={{width:34,height:34,borderRadius:8,background:"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg viewBox="0 0 24 24" style={{width:18,height:18,stroke:C.sec,fill:"none",strokeWidth:1.8,strokeLinecap:"round",strokeLinejoin:"round"}}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </button>
              <SettingsPopover/>
            </div>
            <button className="btHam" onClick={function(){setDrawerOpen(true);}} style={{display:"none",flexDirection:"column",justifyContent:"center",gap:4,width:34,height:34,background:"#f8f8f8",border:"1.5px solid #e8e8e8",borderRadius:8,cursor:"pointer",padding:7}} aria-label="Menu"><span style={{display:"block",height:2,background:C.sec,borderRadius:2}}/><span style={{display:"block",height:2,background:C.sec,borderRadius:2}}/><span style={{display:"block",height:2,background:C.sec,borderRadius:2}}/></button>
          </div>
        </div>
        <div style={{marginTop:8,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <span style={{background:t.badge,color:t.badgeTxt,borderRadius:20,padding:"5px 14px",fontSize:".82rem",fontWeight:700}}>{profile.name}</span>
          <span style={{fontSize:".82rem",color:t.pri,fontWeight:600}}>{age.label} old</span>
        </div>
      </header>

      {settingsOpen&&<div onClick={function(){setSettingsOpen(false);}} style={{position:"fixed",inset:0,zIndex:99}}/>}
      {drawerOpen&&<div onClick={function(){setDrawerOpen(false);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.35)",zIndex:300}}/>}
      {drawerOpen&&(
        <div style={{position:"fixed",top:0,left:0,width:250,height:"100vh",background:"#fff",zIndex:400,boxShadow:"4px 0 20px rgba(0,0,0,.15)",display:"flex",flexDirection:"column"}}>
          <div style={{padding:"16px 18px",borderBottom:"1px solid #eee",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:".85rem",fontWeight:700,color:C.h}}>Navigation</span>
            <button onClick={function(){setDrawerOpen(false);}} style={{width:28,height:28,borderRadius:6,background:"#f5f5f5",border:"1px solid #e8e8e8",cursor:"pointer",fontSize:".85rem",color:C.sec,display:"flex",alignItems:"center",justifyContent:"center"}}>&#10005;</button>
          </div>
          <div style={{padding:"10px 0",flex:1,display:"flex",flexDirection:"column"}}><NavItems onExtra={function(){setDrawerOpen(false);}}/></div>
        </div>
      )}

      <div style={{display:"flex",minHeight:"calc(100vh - 105px)"}}>
        <div className="btNavD" style={{width:200,minWidth:200,background:"#fff",borderRight:"1px solid #eee",padding:"12px 0",position:"sticky",top:105,height:"calc(100vh - 105px)",overflowY:"auto",display:"flex",flexDirection:"column"}}><NavItems/></div>

        <div style={{flex:1,padding:"24px 28px",overflowY:"auto",background:t.contBg}}>

          {/* TRACKER */}
          <div ref={function(el){sectionRefs.current.tracker=el;}} data-sec="tracker" style={{marginBottom:36,scrollMarginTop:HEADER_H}}>
            <div style={{fontSize:"1.05rem",fontWeight:600,color:t.pri,marginBottom:14,display:"flex",alignItems:"center",gap:8}}><NavIcon type="tracker" color={t.pri}/> Tracker</div>

            <div style={{background:"#fff",borderRadius:12,padding:"18px 20px",marginBottom:16,boxShadow:"0 2px 6px rgba(0,0,0,.05)"}}>
              <div style={{fontSize:".9rem",fontWeight:700,color:C.h,marginBottom:4}}>&#x1F37C; Formula Log</div>
              {todayFeeds.length>0&&<div style={{fontSize:".82rem",color:C.body,fontWeight:600,marginTop:2,marginBottom:12}}>Total: {todayOz} oz ({todayFeeds.length} feed{todayFeeds.length!==1?"s":""})</div>}
              {todayFeeds.length===0&&<div style={{height:12}}/>}
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
                <input type="number" step="0.5" min="0" placeholder="Oz" value={feedOz} onChange={function(e){setFeedOz(e.target.value);}} style={{width:64,padding:"8px 10px",border:"1.5px solid "+(t.mid),borderRadius:8,fontSize:".85rem",outline:"none"}}/>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <TimeInput h={feedH} m={feedM} ap={feedAP} onH={setFeedH} onM={setFeedM} onAP={setFeedAP} mid={t.mid}/>
                  <button onClick={setFeedTimeNow} title="Set to now" style={{background:t.lt,border:"1px solid "+(t.mid),borderRadius:6,padding:"7px 8px",fontSize:".7rem",fontWeight:600,color:t.pri,cursor:"pointer",whiteSpace:"nowrap"}}>Now</button>
                </div>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
                <input placeholder="Brand" value={feedBrand} onChange={function(e){setFeedBrand(e.target.value);}} style={{width:100,padding:"8px 10px",border:"1.5px solid "+(t.mid),borderRadius:8,fontSize:".85rem",outline:"none"}}/>
                <input placeholder="Notes" value={feedNote} onChange={function(e){setFeedNote(e.target.value);}} style={{flex:1,minWidth:60,padding:"8px 10px",border:"1.5px solid "+(t.mid),borderRadius:8,fontSize:".85rem",outline:"none"}}/>
                <button onClick={addFeed} style={{background:t.pri,color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontSize:".82rem",fontWeight:600,cursor:"pointer"}}>+ Add</button>
              </div>
              {todayFeeds.length>0?todayFeeds.map(function(f){return(
                <div key={f.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f5f5f5",fontSize:".84rem"}}>
                  <div><strong>{f.oz} oz</strong> <span style={{color:C.sec}}>at {f.time}</span>{f.brand&&<span style={{background:t.badge,color:t.badgeTxt,borderRadius:10,padding:"1px 8px",fontSize:".7rem",marginLeft:6}}>{f.brand}</span>}{f.note&&<span style={{color:C.sec,marginLeft:6,fontStyle:"italic"}}>{f.note}</span>}</div>
                  <button onClick={function(){delFeed(f.id);}} style={{background:"none",border:"none",color:"#ccc",cursor:"pointer"}}>&#10005;</button>
                </div>
              );}):<div style={{fontSize:".82rem",color:C.help,fontStyle:"italic"}}>No feeds logged today</div>}
            </div>

            <div style={{background:"#fff",borderRadius:12,padding:"18px 20px",marginBottom:16,boxShadow:"0 2px 6px rgba(0,0,0,.05)"}}>
              <div style={{fontSize:".9rem",fontWeight:700,color:C.h}}>&#x1F319; Night Sleep</div>
              {todayNightMins>0&&<div style={{fontSize:".82rem",color:C.body,fontWeight:600,marginTop:6,marginBottom:4}}>Total: {formatDurationExact(todayNightMins)}</div>}
              {nightEval&&<div style={{padding:"10px 14px",background:t.lt,borderRadius:8,marginTop:8,fontSize:".82rem",color:C.body,lineHeight:1.5}}>{nightEval}</div>}
              <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:12,marginBottom:12,alignItems:"flex-end"}}>
                <div><div style={{fontSize:".72rem",color:C.sec,marginBottom:3}}>Start</div><TimeInput h={nsH1} m={nsM1} ap={nsAP1} onH={setNsH1} onM={setNsM1} onAP={setNsAP1} mid={t.mid}/></div>
                <div><div style={{fontSize:".72rem",color:C.sec,marginBottom:3}}>End</div><TimeInput h={nsH2} m={nsM2} ap={nsAP2} onH={setNsH2} onM={setNsM2} onAP={setNsAP2} mid={t.mid}/></div>
                <button onClick={addNight} style={{background:t.pri,color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontSize:".82rem",fontWeight:600,cursor:"pointer",marginBottom:2}}>+ Add</button>
              </div>
              {todayNights.length>0?todayNights.map(function(s){return(
                <div key={s.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f5f5f5",fontSize:".84rem"}}>
                  <span><strong>{s.start}</strong> &#8594; <strong>{s.end}</strong> <span style={{color:C.sec,marginLeft:6}}>({formatDurationExact(s.durMins||0)})</span></span>
                  <button onClick={function(){delNight(s.id);}} style={{background:"none",border:"none",color:"#ccc",cursor:"pointer"}}>&#10005;</button>
                </div>
              );}):<div style={{fontSize:".82rem",color:C.help,fontStyle:"italic"}}>No night sleep logged today</div>}
            </div>

            <div style={{background:"#fff",borderRadius:12,padding:"18px 20px",boxShadow:"0 2px 6px rgba(0,0,0,.05)"}}>
              <div style={{fontSize:".9rem",fontWeight:700,color:C.h}}>&#x1F634; Daily Naps</div>
              {todayNapMins>0&&<div style={{fontSize:".82rem",color:C.body,fontWeight:600,marginTop:6,marginBottom:4}}>Total: {formatDurationExact(todayNapMins)}</div>}
              {napEval&&<div style={{padding:"10px 14px",background:t.lt,borderRadius:8,marginTop:8,fontSize:".82rem",color:C.body,lineHeight:1.5}}>{napEval}</div>}
              <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:12,marginBottom:12,alignItems:"flex-end"}}>
                <div><div style={{fontSize:".72rem",color:C.sec,marginBottom:3}}>Start</div><TimeInput h={napH1} m={napM1} ap={napAP1} onH={setNapH1} onM={setNapM1} onAP={setNapAP1} mid={t.mid}/></div>
                <div><div style={{fontSize:".72rem",color:C.sec,marginBottom:3}}>End</div><TimeInput h={napH2} m={napM2} ap={napAP2} onH={setNapH2} onM={setNapM2} onAP={setNapAP2} mid={t.mid}/></div>
                <button onClick={addNap} style={{background:t.pri,color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontSize:".82rem",fontWeight:600,cursor:"pointer",marginBottom:2}}>+ Add</button>
              </div>
              {todayNaps.length>0?todayNaps.map(function(s){return(
                <div key={s.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f5f5f5",fontSize:".84rem"}}>
                  <span><strong>{s.start}</strong> &#8594; <strong>{s.end}</strong> <span style={{color:C.sec,marginLeft:6}}>({formatDurationExact(s.durMins||0)})</span></span>
                  <button onClick={function(){delNap(s.id);}} style={{background:"none",border:"none",color:"#ccc",cursor:"pointer"}}>&#10005;</button>
                </div>
              );}):<div style={{fontSize:".82rem",color:C.help,fontStyle:"italic"}}>No naps logged today</div>}
            </div>
          </div>

          {/* GROWTH */}
          <div ref={function(el){sectionRefs.current.growth=el;}} data-sec="growth" style={{marginBottom:36,scrollMarginTop:HEADER_H}}>
            <div style={{fontSize:"1.05rem",fontWeight:600,color:t.pri,marginBottom:12,display:"flex",alignItems:"center",gap:8}}><NavIcon type="growth" color={t.pri}/> Growth</div>
            <div style={{background:"#fff",borderRadius:12,padding:"18px 20px",boxShadow:"0 2px 6px rgba(0,0,0,.05)"}}>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
                <input type="number" step="0.1" placeholder="Weight (lbs)" value={gW} onChange={function(e){setGW(e.target.value);}} style={{width:110,padding:"8px 10px",border:"1.5px solid "+(t.mid),borderRadius:8,fontSize:".85rem",outline:"none"}}/>
                <input type="number" step="0.1" placeholder="Length (in)" value={gL} onChange={function(e){setGL(e.target.value);}} style={{width:110,padding:"8px 10px",border:"1.5px solid "+(t.mid),borderRadius:8,fontSize:".85rem",outline:"none"}}/>
                <button onClick={addGrowth} style={{background:t.pri,color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontSize:".82rem",fontWeight:600,cursor:"pointer"}}>+ Add</button>
              </div>
              {growthEntries.length>0?growthEntries.slice(0,10).map(function(g){
                var wP=g.weight?getPercentileLabel(g.weight,g.ageMonths!=null?g.ageMonths:age.months,"weight"):null;
                var lP=g.length?getPercentileLabel(g.length,g.ageMonths!=null?g.ageMonths:age.months,"length"):null;
                return(
                <div key={g.id} style={{display:"flex",gap:16,padding:"7px 0",borderBottom:"1px solid #f5f5f5",fontSize:".84rem",alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{color:C.sec,minWidth:80}}>{g.date}</span>
                  {g.weight&&<span><strong>{g.weight} lbs</strong>{wP&&<span style={{color:t.pri,fontSize:".76rem",marginLeft:4}}>({wP})</span>}</span>}
                  {g.length&&<span><strong>{g.length} in</strong>{lP&&<span style={{color:t.pri,fontSize:".76rem",marginLeft:4}}>({lP})</span>}</span>}
                </div>);}):<div style={{fontSize:".82rem",color:C.help,fontStyle:"italic"}}>No entries yet. Record at each well-child visit.</div>}
              <div style={{fontSize:".72rem",color:C.help,marginTop:12,fontStyle:"italic"}}>Approximate percentiles based on WHO Child Growth Standards (0-24 months). For precise percentiles, consult your pediatrician.</div>
            </div>
          </div>

          {/* MILESTONES */}
          <div ref={function(el){sectionRefs.current.milestones=el;}} data-sec="milestones" style={{marginBottom:36,scrollMarginTop:HEADER_H}}>
            <div style={{fontSize:"1.05rem",fontWeight:600,color:t.pri,marginBottom:6,display:"flex",alignItems:"center",gap:8}}><NavIcon type="milestones" color={t.pri}/> Milestones</div>
            <p style={{fontSize:".84rem",color:C.sec,marginBottom:16,lineHeight:1.5}}>Month-by-month developmental milestones based on CDC and AAP guidelines. Check all that apply as {profile.name} achieves them.</p>

            {milestoneData.map(function(md){
              var isOpen=openMonth===md.month;
              var count=getMonthCount(md.month);
              var total=getMonthTotal(md.month);
              var pct=total>0?Math.round((count/total)*100):0;
              var isCurrent=md.month===currentMonth;
              var evalText=getMilestoneEval(profile.name,count,total,pr);
              return(
                <div key={md.month} ref={function(el){monthRefs.current[md.month]=el;}} style={{background:"#fff",borderRadius:12,marginBottom:10,overflow:"hidden",boxShadow:"0 2px 6px rgba(0,0,0,.05)",border:isCurrent?"2px solid "+(t.mid):"none",scrollMarginTop:HEADER_H+4}}>
                  <div onClick={function(){handleMonthToggle(md.month);}} style={{padding:"14px 18px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,flex:1}}>
                      {isCurrent&&<span style={{background:t.pri,color:"#fff",borderRadius:10,padding:"2px 8px",fontSize:".68rem",fontWeight:700,flexShrink:0}}>NOW</span>}
                      <span style={{fontSize:".92rem",fontWeight:600,color:C.h,flexShrink:0}}>{md.label}</span>
                      <div style={{flex:1,maxWidth:120,height:6,background:"#eee",borderRadius:3,overflow:"hidden",marginLeft:4}}>
                        <div style={{width:pct+"%",height:"100%",background:count===0?"transparent":pct>=75?"#4caf50":pct>=50?"#f59e0b":"#e57373",borderRadius:3,transition:"width .3s"}}/>
                      </div>
                      <span style={{fontSize:".78rem",color:count===0?"#ccc":pct>=75?"#4caf50":pct>=50?"#f59e0b":"#e57373",fontWeight:600}}>{count}/{total}</span>
                    </div>
                    <span style={{fontSize:".82rem",color:t.learn,fontWeight:600,marginLeft:8}}>{isOpen?"\u25B2":"\u25BC"}</span>
                  </div>
                  {isOpen&&(
                    <div style={{padding:"0 18px 18px",borderTop:"1px solid #f0f0f0"}}>
                      <p style={{fontSize:".84rem",color:C.body,lineHeight:1.6,margin:"14px 0"}}>{genderize(md.summary,gender)}</p>
                      <div style={{padding:"12px 16px",background:t.lt,borderRadius:10,marginBottom:14,fontSize:".84rem",color:C.body,lineHeight:1.6}}>{evalText}</div>
                      <p style={{fontSize:".76rem",color:C.help,margin:"0 0 10px",fontStyle:"italic"}}>Check all that apply:</p>
                      {md.categories.map(function(cat){
                        var cc=getCatCount(md.month,cat.cat);
                        return(
                          <div key={cat.cat} style={{marginTop:12}}>
                            <div style={{fontSize:".76rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",color:C.body,marginBottom:6,display:"flex",alignItems:"center"}}>{cat.cat}{cc>0&&<Badge count={cc}/>}</div>
                            {cat.items.map(function(item,idx){
                              var k=md.month+"-"+cat.cat+"-"+idx;
                              var checked=!!milestoneChecks[k];
                              var ds=milestoneChecks[k];
                              return(
                                <div key={idx} onClick={function(){toggleCheck(md.month,cat.cat,idx);}} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",cursor:"pointer",borderBottom:"1px solid #f8f8f8"}}>
                                  <div style={{width:20,height:20,borderRadius:4,border:checked?"2px solid "+(t.pri):"2px solid #ddd",background:checked?t.pri:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                                    {checked&&<span style={{color:"#fff",fontSize:".7rem",fontWeight:800}}>&#10003;</span>}
                                  </div>
                                  <span style={{fontSize:".84rem",color:C.body,flex:1}}>{genderize(item,gender)}</span>
                                  {ds&&<span style={{fontSize:".66rem",color:C.help}}>{ds}</span>}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                      <div style={{marginTop:14}}>
                        <button onClick={function(){doDive("milestone","ms-"+md.month,"Month "+md.month+" milestones for "+profile.name+", "+age.label+" old. Checked: "+count+"/"+total+".");}} style={{background:diveResults["ms-"+md.month]?t.hover:t.badge,color:t.badgeTxt,border:"1px solid "+(t.mid),borderRadius:8,padding:"8px 14px",fontSize:".8rem",fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                          <span>{diveResults["ms-"+md.month]?"\u2715":"\u2728"}</span>{diveResults["ms-"+md.month]?"Close Deep Dive":"AI Deep Dive"}
                        </button>
                      </div>
                      {diveLoading===("ms-"+md.month)&&<Spinner/>}
                      {diveResults["ms-"+md.month]&&!diveLoading&&(
                        <div style={{marginTop:10,padding:14,background:"linear-gradient(135deg,"+(t.lt)+",#fff)",borderRadius:10,border:"1px solid "+(t.mid),fontSize:".83rem",color:C.body,lineHeight:1.9}}>
                          <div style={{fontSize:".66rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",color:t.pri,marginBottom:8}}>&#x2728; Personalized for {profile.name}</div>
                          {diveResults["ms-"+md.month].split("\n").filter(Boolean).map(function(pt,i){return <p key={i} style={{marginBottom:10}}>{renderBold(pt)}</p>;})}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* SUMMARY */}
          <MonthlySummarySection feeds={feeds} nightSleep={nightSleep} naps={naps} growthEntries={growthEntries} profile={profile} age={age} t={t} sectionRef={function(el){sectionRefs.current.summary=el;}} />

          {/* EDUCATION */}
          <div ref={function(el){sectionRefs.current.education=el;}} data-sec="education" style={{marginBottom:36,scrollMarginTop:HEADER_H}}>
            <div style={{fontSize:"1.05rem",fontWeight:600,color:t.pri,marginBottom:6,display:"flex",alignItems:"center",gap:8}}><NavIcon type="education" color={t.pri}/> Education</div>
            <p style={{fontSize:".84rem",color:C.sec,marginBottom:16,lineHeight:1.5}}>Evidence-based guidance from CDC, AAP, and WHO.</p>

            {educationData.map(function(topic){
              var isOpen=openEdu===topic.id;
              var topicDiveKey="edu-"+topic.id;
              var allContent=topic.articles.map(function(a){return a.t+": "+a.content;}).join("\n\n");
              return(
              <div key={topic.id} ref={function(el){eduRefs.current[topic.id]=el;}} style={{background:"#fff",borderRadius:12,marginBottom:10,overflow:"hidden",boxShadow:"0 2px 6px rgba(0,0,0,.05)",scrollMarginTop:HEADER_H+4}}>
                <div onClick={function(){handleEduToggle(topic.id);}} style={{padding:"16px 18px",cursor:"pointer"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <span style={{fontSize:".95rem",fontWeight:700,color:C.h}}>{topic.icon} {topic.title}</span>
                    <span style={{fontSize:".82rem",color:t.learn,fontWeight:600}}>{isOpen?"\u25B2":"\u25BC"}</span>
                  </div>
                  {!isOpen&&<div style={{fontSize:".82rem",color:C.sec,marginTop:6,lineHeight:1.5}}>{topic.preview}</div>}
                </div>
                {isOpen&&(
                  <div style={{padding:"0 18px 18px",borderTop:"1px solid #f0f0f0"}}>
                    {topic.articles.map(function(art,ai){return(
                      <div key={ai} style={{marginTop:16}}>
                        <div style={{fontSize:".88rem",fontWeight:700,color:C.body,marginBottom:4}}>{art.t}</div>
                        {art.table&&<DataTable headers={art.table.headers} rows={art.table.rows}/>}
                        <div style={{fontSize:".84rem",color:C.body,lineHeight:1.65}}>{art.content}</div>
                      </div>
                    );})}
                    <div style={{marginTop:16,borderTop:"1px solid #f0f0f0",paddingTop:12}}>
                      <button onClick={function(){doDive("education",topicDiveKey,"Category: "+topic.title+". Baby: "+profile.name+", "+age.label+" old.\n\n"+allContent);}} style={{background:diveResults[topicDiveKey]?t.hover:t.badge,color:t.badgeTxt,border:"1px solid "+(t.mid),borderRadius:6,padding:"6px 12px",fontSize:".76rem",fontWeight:600,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:4}}>
                        <span>{diveResults[topicDiveKey]?"\u2715":"\u2728"}</span>{diveResults[topicDiveKey]?"Close Deep Dive":"AI Deep Dive - "+topic.title}
                      </button>
                      {diveLoading===topicDiveKey&&<Spinner/>}
                      {diveResults[topicDiveKey]&&!diveLoading&&(
                        <div style={{marginTop:8,padding:14,background:"linear-gradient(135deg,"+(t.lt)+",#fff)",borderRadius:10,border:"1px solid "+(t.mid),fontSize:".82rem",color:C.body,lineHeight:1.9}}>
                          <div style={{fontSize:".64rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",color:t.pri,marginBottom:8}}>&#x2728; Personalized for {profile.name}</div>
                          {diveResults[topicDiveKey].split("\n").filter(Boolean).map(function(pt,i){return <p key={i} style={{marginBottom:10}}>{renderBold(pt)}</p>;})}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );})}
          </div>

          {/* RESOURCES */}
          <div ref={function(el){sectionRefs.current.resources=el;}} data-sec="resources" style={{marginBottom:36,scrollMarginTop:HEADER_H}}>
            <div style={{fontSize:"1.05rem",fontWeight:600,color:t.pri,marginBottom:6,display:"flex",alignItems:"center",gap:8}}><NavIcon type="resources" color={t.pri}/> Resources</div>
            <p style={{fontSize:".84rem",color:C.sec,marginBottom:16,lineHeight:1.5}}>Credible sources for learning more about your baby's development, health, and well-being.</p>
            <div style={{background:"#fff",borderRadius:12,padding:"18px 20px",boxShadow:"0 2px 6px rgba(0,0,0,.05)"}}>
              {resourcesData.map(function(r,i){return(
                <div key={i} style={{padding:"10px 0",borderBottom:i<resourcesData.length-1?"1px solid #f5f5f5":"none"}}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" style={{fontSize:".88rem",fontWeight:600,color:C.body,textDecoration:"none"}}>{r.name}</a>
                  <div style={{fontSize:".8rem",color:C.sec,marginTop:2}}>{r.desc}</div>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" style={{fontSize:".72rem",color:C.help,marginTop:2,display:"inline-block",textDecoration:"underline"}}>{r.url.replace("https://","")}</a>
                </div>
              );})}
            </div>
          </div>

          <div style={{marginTop:20}}>
            <p style={{fontSize:".72rem",color:C.help,lineHeight:1.6}}>Sources: CDC, AAP, and WHO evidence-based guidelines. Not a substitute for pediatric advice.</p>
          </div>
          <div style={{padding:"16px 0",borderTop:"1px solid #eee",marginTop:12}}>
            <p style={{fontSize:".76rem",color:C.help,textAlign:"center"}}>BabyTracker &middot; Every Milestone Matters</p>
            <p style={{fontSize:".68rem",color:C.sec,marginTop:4,fontStyle:"italic",textAlign:"center"}}>Powered by Grandma <span style={{color:"#e57373"}}>&hearts;</span></p>
          </div>
        </div>
      </div>

      {/* CHAT */}
      {chatOpen&&(
        <div style={{position:"fixed",bottom:0,right:0,width:390,maxWidth:"100vw",height:"min(620px,85vh)",background:"#fff",borderTopLeftRadius:16,boxShadow:"-4px -4px 24px rgba(0,0,0,.15)",zIndex:500,display:"flex",flexDirection:"column",overflow:"hidden",border:"1px solid "+(t.mid)}}>
          <div style={{padding:"14px 18px",background:BRAND,color:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
            <div><div style={{fontWeight:700,fontSize:".92rem"}}>Ask BabyAdvisor</div><div style={{fontSize:".72rem",opacity:.8}}>{profile.name} &middot; {age.label} old</div></div>
            <button onClick={function(){setChatOpen(false);}} style={{background:"rgba(255,255,255,.2)",border:"none",color:"#fff",width:28,height:28,borderRadius:6,cursor:"pointer",fontSize:".85rem"}}>&#10005;</button>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:16}}>
            {chatMsgs.length===0&&(
              <div>
                <p style={{fontSize:".85rem",color:C.sec,marginBottom:12,lineHeight:1.6}}>Hi! I'm BabyAdvisor - personalized for {profile.name}. Ask me anything:</p>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {["Is this enough formula for "+pr.pos+" age?","Sleep tips for a "+currentMonth+"-month-old","When should "+pr.sub+" start solids?","What's changed about baby care since I was a parent?"].map(function(s,i){return <button key={i} onClick={function(){setChatInput(s);}} style={{background:t.lt,border:"1px solid "+(t.mid),borderRadius:8,padding:"8px 12px",fontSize:".82rem",color:t.pri,cursor:"pointer",textAlign:"left",fontWeight:500}}>{s}</button>;})}
                </div>
              </div>
            )}
            {chatMsgs.map(function(m,i){return(
              <div key={i} style={{marginBottom:12,display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                <div style={{maxWidth:"85%",padding:"10px 14px",borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",background:m.role==="user"?t.pri:t.lt,color:m.role==="user"?"#fff":C.body,fontSize:".84rem",lineHeight:1.7}}>
                  {m.text.split("\n").filter(Boolean).map(function(pt,j){return <p key={j} style={{marginBottom:4}}>{renderBold(pt)}</p>;})}
                </div>
              </div>
            );})}
            {chatLoading&&<div style={{display:"flex",justifyContent:"flex-start",marginBottom:12}}><div style={{padding:"10px 14px",borderRadius:"14px 14px 14px 4px",background:t.lt}}><Spinner/></div></div>}
            <div ref={chatEndRef}/>
          </div>
          <div style={{padding:"10px 14px",borderTop:"1px solid #eee",display:"flex",gap:8,flexShrink:0}}>
            <input ref={chatInputRef} value={chatInput} onChange={function(e){setChatInput(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter")sendChat();}} placeholder="Ask about baby care..." style={{flex:1,padding:"10px 14px",border:"1.5px solid "+(t.mid),borderRadius:10,fontSize:".86rem",outline:"none"}}/>
            <button onClick={sendChat} disabled={!chatInput.trim()||chatLoading} style={{background:BRAND,color:"#fff",border:"none",borderRadius:10,padding:"0 18px",fontWeight:700,cursor:chatInput.trim()&&!chatLoading?"pointer":"not-allowed",opacity:chatInput.trim()&&!chatLoading?1:.5,fontSize:".86rem"}}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}