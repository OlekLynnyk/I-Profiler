'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import GlobalLoading from '@/app/loading';
import Link from 'next/link';

type ImageItem = {
  id: string;
  src: string;
  title: string;
  description: string;
};

const BASE_IMAGES: ImageItem[] = [
  {
    id: '1',
    src: '/gallery/gallery1.jpg',
    title: 'Elegant Free Spirit',
    description: `

A. PROFILING RESULTS

The individual is wearing a black one-shoulder bodysuit paired with fishnet stockings, standing under an archway with arms raised gracefully. The body language conveys confidence and openness, while the dark color palette emphasizes sophistication and control. The combination of bold style and poised demeanor suggests a harmony between elegance and freedom.

Explicit Qualities:
Elegance — refined aesthetic awareness and grace in presentation.
Sensuality — self-assuredness, embodiment, and comfort with presence.
Freedom — emotional openness, confidence in movement, and authenticity.
Confidence — expressed through posture and symmetry of the pose.
Artistic Sensibility — awareness of form, composition, and aesthetic framing.

Shadow Qualities:
Elegance — simplicity or minimalism as a counterbalance.
Sensuality — modesty or introspection beneath the confident surface.
Freedom — restraint, self-discipline, or the need for internal order.
Confidence — vulnerability and sensitivity hidden behind self-control.
Expression — fear of misinterpretation or overexposure.

Contradictions and Core Inner Conflict:
Primary Contradiction:
Freedom vs. Restraint — balancing open expression with inner discipline.
Supporting Contradictions:
Elegance vs. Simplicity — alternating between refinement and minimalism.
Sensuality vs. Modesty — navigating between visibility and self-protection.

Balance of Underlying Contradictions (BUC):
Freedom vs. Restraint — the defining polarity of this persona, driving her ability to express fully while maintaining self-command.

Bright and Hidden:
Bright — elegance, sensuality, freedom, and composure.
Hidden — modesty, self-control, and simplicity.

Approximation:
Personal Style — Elegant Freedom: sophistication shaped by authenticity.
Shadow Style — Controlled Expression: liberation moderated by grace.
Role — The Elegant Free Spirit: moves fluidly between expression and containment.
Hidden Command — "See me as elegant and free, but understand my need for control and simplicity."
 


B. APPLICATION OF PROFILING RESULTS

Best Meeting Setting:
An informal, aesthetic environment — such as an art gallery, creative studio, or a refined café — suits this persona best. It allows for both creative expression and emotional comfort, blending elegance with ease.

Details That Matter & Why:
Attire — the one-shoulder bodysuit and fishnets communicate bold self-expression and style consciousness; they serve as conversation gateways into individuality and confidence.
Pose — arms raised under an archway reveal comfort in self-expression and confidence in physicality, reflecting emotional openness within boundaries.
Setting — architectural framing suggests appreciation for art, symmetry, and meaningful aesthetics — a cue to match tone and context.

Tailored Icebreaker:
"I really appreciate how your style communicates both freedom and grace — do you often find creative inspiration in fashion or architecture?"

Transition Into Business:
"Your sense of elegance and openness reminds me of how we approach innovation — structured creativity, free within defined form."

Cold-Reaction Scenario:
If the response is cool or distant:
"I understand your need for space — we value freedom within structure too. Perhaps we can reconnect when timing feels more aligned, balancing creativity and clarity."

Motivators:
– Freedom with safety.  
– Recognition with discretion.  
– Environments where aesthetics meet intellect.


C. CONCLUSION

Core Statement:
"See me as elegant and free, but understand my need for control and simplicity."
`,
  },

  {
    id: '2',
    src: '/gallery/gallery2.jpg',
    title: 'Calm x Impulse',
    description: `

A. OBSERVATION

The individual is wearing a blue shirt, a maroon jacket, and a black cap with a logo. The jacket is open, suggesting a relaxed and confident posture. The color combination of blue and maroon projects both calmness and emotional warmth, while the cap introduces a practical, casual tone. The overall impression is of someone who appears composed but carries a latent readiness for action or change.

Explicit Qualities:
Blue Shirt — calmness, dependability, emotional steadiness.
Maroon Jacket — warmth, empathy, comfort, emotional openness.
Black Cap — practicality, functionality, social belonging, and style awareness.

Shadow Qualities:
Calmness — impulsiveness, hidden bursts of energy or restlessness.
Warmth — detachment, periods of introspection or withdrawal.
Practicality — indulgence, moments of emotional or sensory spontaneity.

Contradictions and Core Inner Conflict:
Primary Contradiction:
Calmness vs. Impulsiveness — the person outwardly projects composure while internally balancing an urge for excitement or movement.
Supporting Contradictions:
Warmth vs. Detachment — alternating between emotional openness and self-protection.
Practicality vs. Indulgence — navigating between self-discipline and spontaneous enjoyment.

Balance of Underlying Contradictions (BUC):
Calmness vs. Impulsiveness — a central dynamic reflecting a poised exterior anchored by quiet restlessness beneath.

Bright and Hidden:
Bright — calm presence, warmth, composure.
Hidden — impulsivity, emotional swings, suppressed adventurousness.

Approximation:
Personal Style — Relaxed Structure: composed yet open, emotionally centered yet flexible.
Shadow Style — Spontaneous Explorer: inner drive for novelty under a calm, dependable surface.
Role — The Adventurous Comforter: offers emotional grounding while secretly seeking stimulation and change.

Hidden Command:
"I am calm and steady, but let me explore my impulses without judgment."
 

B. PROFILING ACCESSORIES AND OVERALL ENSEMBLE

Accessory Profiling:
The black cap with a logo serves as both a practical item and a signal of belonging — to a brand, idea, or community. It connects individual identity with collective meaning, showing a balance between independence and association.

Symbolic Interpretation:
– Cap = belonging, shared identity, externalized practicality.  
– Jacket = emotional warmth, desire for connection, outward approachability.  
– Blue shirt = internal calm, reflective stability.  

Integrated Meaning:
The ensemble communicates reliability wrapped in comfort, with subtle readiness for change or movement. The casual openness of the jacket offsets the internal structure implied by the cap and shirt.

Hidden Command (refined):
"I am practical and stylish, but I belong to something greater."
 

C. CONCLUSION

Core Statement:
"I am practical and stylish, but I belong to something greater."
`,
  },

  {
    id: '3',
    src: '/gallery/gallery3.jpg',
    title: 'Casual & Ready',
    description: `

A. OBSERVATION

The individual is dressed in a white sleeveless shirt and light blue jeans, photographed from a low angle with a modern building and cloudy sky in the background. The overall impression communicates grounded confidence — casual, simple, yet prepared for action. The composition evokes freedom, readiness, and a quiet assertiveness rooted in comfort.

Explicit Qualities:
White Sleeveless Shirt — simplicity, functionality, comfort.
Light Blue Jeans — casualness, practicality, everyday ease.
Posture — readiness, openness, calm energy.
Color Palette — soft, approachable, and balanced, suggesting trust and emotional stability.

Shadow Qualities:
Simplicity — masks sophistication or unspoken complexity.
Comfort — conceals an inner drive for challenge and progress.
Casualness — hides a disciplined, strategic core.
Relaxation — might balance an internal restlessness or need for achievement.

Contradictions and Core Inner Conflict:
Primary Contradiction:
Simplicity vs. Complexity — balancing a minimal exterior with an intellectually or emotionally complex inner life.
Supporting Contradiction:
Comfort vs. Challenge — appearing relaxed while internally drawn toward purposeful action or growth.

Balance of Underlying Contradictions (BUC):
Simplicity/Comfort vs. Complexity/Challenge — the person continuously aligns between outer ease and inner ambition.

Bright and Hidden:
Bright — calm confidence, simplicity, ease.
Hidden — curiosity, strategic thinking, readiness for challenge.

Approximation:
Personal Style — Effortless Readiness: comfort combined with quiet strength.
Shadow Style — Hidden Strategist: understated yet determined.
Role — The Grounded Explorer: thrives in freedom, balance, and self-direction.
Hidden Command — "I am casual and calm, but always ready to take on the next challenge."
 


B. JOB SUITABILITY

Best Fit Jobs:
Outdoor Adventure Guide — natural alignment with physicality, flexibility, and challenge-seeking.
Creative Freelancer (Designer, Photographer, Writer) — combines relaxed autonomy with hidden complexity and refined self-discipline.
Fitness Trainer or Coach — integrates physical readiness and motivation, transforming simplicity into focused energy.

Moderate Fit Jobs:
Startup Team Member — adaptability and action-oriented mindset fit dynamic, less formal work environments.
Content Creator — authenticity and relatability expressed through simple yet meaningful presentation.

Unsuitable Jobs:
Corporate Lawyer — rigid structure conflicts with freedom-oriented nature.
Banker — formal constraints and repetitiveness clash with creative drive.
Office Administrator — lack of variety and challenge may stifle growth potential.

Behavioral Traits in Work:
They perform best when autonomy is respected, and roles allow both practical execution and subtle creativity.  
They prefer direct communication, clarity, and environments with dynamic energy rather than excessive formality.


C. CONCLUSION

Core Statement:
"Casual, practical, and relaxed — grounded in simplicity, yet driven by an inner readiness for challenge."
`,
  },

  {
    id: '4',
    src: '/gallery/gallery4.jpg',
    title: 'Elegant Bold',
    description: `

A. OBSERVATION

The person is wearing a long, flowing dress with a high slit — a design that merges classical elegance with expressive confidence. The light tone of the fabric conveys purity and refinement, while the greenish-gold hue introduces luxury and individuality. Together, these choices reveal a personality that moves gracefully between sophistication and assertive presence.

Explicit Qualities:
Elegance — refined taste and an appreciation for timeless beauty.
Sophistication — attention to detail, emotional restraint, and poise.
Boldness — readiness to stand out and make deliberate statements.
Purity — clarity of intention and simplicity of aesthetic.
Luxury — appreciation of quality, sensual texture, and subtle opulence.
Uniqueness — individuality expressed through refined personal choices.

Shadow Qualities:
Simplicity — may conceal a longing for complexity or intellectual depth.
Boldness — can mask vulnerability or an inner need for validation.
Purity — might hide inner contradiction or the fear of imperfection.
Luxury — could represent a response to insecurity or the desire for stability.

Contradictions and Core Inner Conflict:
Primary Contradiction:
Elegance vs. Boldness — the constant balance between refined subtlety and confident expression.
Supporting Contradictions:
Purity vs. Luxury — harmony between simplicity and richness, clarity and sensuality.

Balance of Underlying Contradictions (BUC):
Elegance and Boldness — the defining polarity, shaping a personality that commands attention while maintaining grace.

Bright and Hidden:
Bright — poise, composure, confidence, refined charm.
Hidden — vulnerability, inner tension, longing for acknowledgment.

Approximation:
Personal Style — Classic Modern: a synthesis of tradition and individuality.
Shadow Style — Controlled Expression: a balance between restraint and visibility.
Role — The Poised Visionary: inspiring others through elegance that dares to be seen.
Hidden Command — "Recognize my elegance but respect my boldness."
 


B. PREDICTED REACTIONS & TRIGGERS

Predicted Reactions:
They respond positively when both their sophistication and courage are acknowledged. Validation of taste and recognition of individuality strengthen trust and engagement.  
Likely Triggers:
– Being underestimated or perceived as merely “decorative.”  
– Situations that ignore their intellectual depth.  
– Environments lacking respect for nuance or beauty.  

Best Opening Words:
"Your elegance is captivating, and your boldness is genuinely inspiring — it’s rare to see both qualities expressed so harmoniously."

Tone and Manner:
Approach with composure and clarity. Combine admiration for their aesthetic strength with genuine respect for their substance. Avoid flattery; favor authenticity and intellectual depth.

Finding the Root Cause:
Their internal friction often stems from managing visibility and control — wanting to shine while preserving refinement.  
Ask reflective questions such as:  
– "When do you feel your elegance is challenged by your assertiveness?"  
– "What helps you stay balanced between being seen and being understood?"

Reframing in Their Language:
"It sounds like you’re navigating between expressing your boldness and protecting your elegance. How can we create space for both to coexist naturally?"

Joint Resolution Protecting Their Values:
"Let’s find a way that lets your elegance define the tone while your boldness sets the direction — ensuring both your refinement and courage are respected."


C. CONCLUSION

Core Statement:
"Recognize my elegance but respect my boldness."
`,
  },

  {
    id: '5',
    src: '/gallery/gallery5.jpg',
    title: 'Ethereal Elegance',
    description: `

A. OBSERVATION

The person is wearing a flowing, layered dress in soft tones of pale yellow and light blue, tied with a delicate purple sash. The sleeves are wide and sheer, giving the outfit an airy, almost weightless quality. The movement of the fabric conveys grace and emotional openness, while the combination of colors evokes serenity and balance.

Explicit Qualities:
Elegance — the refined and harmonious design reflects composure and sophistication.
Freedom — the fluid layers and movement of fabric suggest openness and personal liberation.
Delicacy — pastel tones and sheer textures emphasize sensitivity and gentleness.
Grace — posture and form communicate effortless presence and refined coordination.

Shadow Qualities:
Constriction — the opposite of freedom, suggesting an underlying need for boundaries and order.
Boldness — the counterpoint to delicacy, reflecting latent assertiveness and power.
Clumsiness — the hidden fear of imperfection or emotional imbalance.
Simplicity — the tension beneath elegance, indicating a wish for practical groundedness.

Contradictions and Core Inner Conflict:
Primary Contradiction:
Freedom vs. Constriction — balancing fluid self-expression with the need for containment and discipline.
Supporting Contradictions:
Elegance vs. Simplicity — refinement paired with a desire for natural authenticity.
Delicacy vs. Boldness — tenderness interwoven with quiet strength.

Balance of Underlying Contradictions (BUC):
Freedom vs. Constriction — the central axis of personality; moving gracefully within invisible structure.

Bright and Hidden:
Bright — elegance, grace, freedom, serenity.
Hidden — the need for structure, control, and simplicity beneath the delicate presentation.

Approximation:
Personal Style — Ethereal Elegance: graceful, fluid, emotionally expressive.
Shadow Style — Structured Serenity: balance between creative freedom and inner control.

Completion:
The analysis is complete when freedom and structure are reconciled through poise and self-awareness.

Hidden Command:
"Let me move freely, but allow me to remain balanced and whole."
 


B. INTRINSIC MOTIVATORS AND EVOLUTION

Intrinsic Motivators:
Expression of Elegance — strong drive to present harmony, refinement, and inner calm.
Seeking Freedom — deep desire to avoid restriction while maintaining coherence and integrity.
Balancing Control — need to create personal systems that preserve spontaneity within structure.
Inner Delicacy — emotional sensitivity that enhances empathy and artistic perception.
Hidden Strength — quiet resilience, enabling stability under emotional or external pressure.

Evolution Over Time:
As this person matures, the ongoing dialogue between freedom and control becomes more integrated:
– They begin shaping freedom through mindful boundaries, creating routines that nurture creativity instead of limiting it.
– Elegance evolves from aesthetic refinement into internal balance — calm strength expressed through graceful simplicity.
– The hidden assertiveness gradually surfaces as quiet authority, turning fragility into disciplined poise.
– Their self-expression becomes holistic, merging physical grace with psychological equilibrium.

Growth Path:
Grace transformed into grounded authenticity.
Freedom translated into disciplined flow.
Elegance expanded into self-mastery.


C. CONCLUSION

Core Statement:
Personal Style — Ethereal Elegance: graceful and fluid, balanced by an underlying structure.
`,
  },
  {
    id: '6',
    src: '/gallery/gallery6.jpg',
    title: 'Gold & Simple',
    description: `

A. OBSERVATION

The individual is wearing gold-colored sandals with a minimalist design — a single strap over the toes and a simple ankle buckle. The toenails are painted pink, adding a soft, playful accent to an otherwise understated look. The combination suggests a personality that values elegance without excess — confident yet grounded, aesthetic yet practical.

Explicit Qualities:
Luxury — represented by the gold tone, symbolizing refinement, confidence, and self-value.
Simplicity — reflected in the clean sandal design, showing practicality and restraint.
Femininity — expressed through pink nail polish, hinting at warmth and personal care.
Comfort — open design suggests ease, naturalness, and relaxed poise.

Shadow Qualities:
Luxury — hides modesty and fear of extravagance.
Simplicity — conceals latent indulgence or aspiration for sophistication.
Femininity — might mask strength or independence.
Comfort — can hide avoidance of challenge or discomfort.

Contradictions and Core Inner Conflict:
Primary Contradiction:
Luxury vs. Simplicity — the person balances elegance with restraint, valuing beauty but rejecting excess.
Supporting Contradiction:
Playfulness vs. Formality — the pink nails introduce lightness into an otherwise disciplined look.

Balance of Underlying Contradictions (BUC):
Elegance vs. Simplicity — the equilibrium between sophistication and minimalism forms the essence of this persona.

Bright and Hidden:
Bright — refinement, composure, elegance, and polish.
Hidden — practicality, modesty, self-discipline.

Approximation:
Personal Style — Elegant Simplicity: balance between aesthetic expression and functional minimalism.
Shadow Style — Modest Indulgence: controlled elegance with subtle desire for recognition.
Role — The Balanced Aesthetic: one who values harmony between beauty and utility.
Hidden Command — "I am elegant yet practical; appreciate my style but recognize my need for comfort."
 


B. APPLICATION TO TEAM ROLES

Primary Belbin Role: Resource Investigator  
Outgoing, expressive, and stylish, this person excels at forming connections and spotting opportunities. Their elegant attention to detail translates into enthusiasm and the ability to bring external energy into a group.

Secondary Belbin Role: Implementer  
Their practicality and simplicity enable them to convert ideas into concrete action. Reliable, disciplined, and efficient — they balance creativity with structured follow-through.

How to Leverage in a Team:
As a Resource Investigator — encourage them to lead networking efforts, partnerships, or early-stage idea exploration.  
As an Implementer — rely on them to bring organization and aesthetic clarity to complex processes.

Key Risk to Watch:
Over-enthusiasm — their curiosity and expressiveness may lead to scattered focus or unfulfilled initiatives if not grounded in structure. Provide frameworks that sustain their enthusiasm with tangible results.

Leadership Insight:
This persona thrives in hybrid roles — where creativity meets execution, aesthetics meet pragmatism, and human connection meets reliability. They bring energy, refinement, and follow-through when balance is maintained.


C. CONCLUSION

Core Statement:
"I am elegant yet practical; appreciate my style but recognize my need for comfort."
`,
  },

  {
    id: '7',
    src: '/gallery/gallery7.jpg',
    title: 'Structured Edge',
    description: `

A. OBSERVATION

The person is wearing an all-black outfit composed of a fitted blazer and fishnet stockings. The contrast of structured tailoring with provocative texture conveys duality — discipline blended with expressive confidence. The lighting is dramatic, highlighting the face and upper body, reinforcing a sense of control and intensity.

Explicit Qualities:
Seriousness — the monochrome color and sharp silhouette project focus and composure.
Professionalism — the blazer symbolizes order, responsibility, and control.
Sophistication — black conveys maturity, restraint, and refinement.
Boldness — the fishnet stockings introduce courage, expression, and edge.
Creativity — combining structured and daring elements implies imaginative confidence.

Shadow Qualities:
Playfulness — suppressed spontaneity hidden beneath discipline.
Casualness — a relaxed, adaptive nature muted by professional rigor.
Caution — boldness conceals a reserved, observant undercurrent.
Vulnerability — behind confidence lies sensitivity to perception and judgment.

Contradictions and Core Inner Conflict:
Primary Contradiction:
Professionalism vs. Boldness — the balance between control and creative rebellion.
Supporting Contradictions:
Seriousness vs. Playfulness — containment versus emotional release.
Structure vs. Spontaneity — measured composure meeting impulsive energy.
Maturity vs. Risk — refinement challenged by expressive experimentation.

Balance of Underlying Contradictions (BUC):
Professionalism vs. Boldness — mastery in maintaining control while daring to challenge convention.

Bright and Hidden:
Bright — structure, composure, confidence, control.
Hidden — curiosity, sensuality, suppressed spontaneity.

Approximation:
Personal Style — Structured Edge: disciplined yet expressive, poised but provocative.
Shadow Style — Controlled Rebellion: seeking freedom within boundaries.
Hidden Command:
"Respect my structure, but recognize the fire beneath it."
 


B. APPLICATION TO TEAM ROLES

Primary Belbin Team Role: Shaper
Characterized by drive, ambition, and clarity of direction. This person thrives on challenge, ensuring the team remains dynamic and forward-moving. They are decisive, assertive, and committed to achieving results.

Secondary Belbin Team Role: Resource Investigator
Their creative spark and willingness to push boundaries allow them to identify new opportunities, connections, and unconventional solutions. They bring energy and curiosity to exploratory phases of teamwork.

How to Leverage in the Team:
Shaper — position them in leadership or project-driving roles, where their determination and sense of purpose can focus collective effort.
Resource Investigator — engage their curiosity in early-stage idea development, networking, or innovation tasks.

Key Risk to Watch:
Over-Dominance — the same strength that propels them forward may suppress quieter team voices or alternative perspectives.
Balancing Mechanism — pair them with reflective or stabilizing profiles (Monitor Evaluator, Teamworker) to temper intensity without reducing drive.

Ideal Environment:
Thrives in high-pressure, creative, or competitive contexts where boundaries can be tested within structured frameworks.


C. CONCLUSION

Core Statement:
The balance between maintaining a professional demeanor and expressing creativity or rebellion.
`,
  },

  {
    id: '8',
    src: '/gallery/gallery8.jpg',
    title: 'Tough & Tender',
    description: `

A. OBSERVATION

The person is wearing a black leather jacket, a black top, and blue jeans. The leather jacket symbolizes toughness, confidence, and rebellion, while the jeans introduce practicality and comfort. The combination of dark tones with casual pieces suggests a persona that blends strength with relatability.

Explicit Qualities:
Toughness — resilience, assertiveness, protective presence.
Comfort — ease, familiarity, physical and emotional grounding.
Practicality — functionality, directness, focus on what works.
Rebellion — independence, nonconformity, authenticity of expression.

Shadow Qualities:
Vulnerability — emotional openness hidden beneath the armor of strength.
Discomfort — internal tension when balance between strength and softness is lost.
Impracticality — occasional impulsiveness in the pursuit of independence.
Conformity — subtle desire for belonging despite a rebellious surface.

Contradictions and Core Inner Conflict:
Primary Contradiction:
Toughness vs. Vulnerability — strength as protection, softness as truth; both essential to integrity.
Supporting Contradictions:
Comfort vs. Discomfort — balance between control and emotional exposure.
Practicality vs. Impracticality — navigating between grounded realism and emotional impulse.
Rebellion vs. Conformity — desire for individuality tempered by the wish to connect.

Balance of Underlying Contradictions (BUC):
Toughness vs. Vulnerability — the central dynamic; visible confidence concealing a need for understanding.

Bright and Hidden:
Bright — strength, assertiveness, self-sufficiency.
Hidden — sensitivity, emotional honesty, longing for acceptance.

Approximation:
Personal Style — Street Strength: confident, practical, resilient.
Shadow Style — Gentle Defender: protective yet emotionally intuitive.

Hidden Command:
"I am tough, but understand my vulnerability."
 


B. HIDDEN COMMAND AND INTRINSIC MOTIVATION

Hidden Command:
"I am tough, but understand my vulnerability." This conveys a dual desire: to be respected for resilience yet accepted for emotional depth.

Intrinsic Motivation:
  Seeks genuine connection without compromising strength.  
– Values trust, loyalty, and emotional honesty in relationships and professional contexts.  
– Desires recognition of depth behind the confident, rebellious image.  
– Balances independence with the need for belonging and understanding.

Structured Approach to Interaction:
(a) Persona Calibration:
Engage with respect for their strength, while gently validating their inner sensitivity.
Suggested opening tone: “I admire your clarity and composure.”

(b) Predicted Reactions and Triggers:
May respond defensively if vulnerability is addressed too directly.
Triggers include dismissal, superficiality, or being misread as “cold.”

(c) Finding the Root Cause:
Ask open-ended questions that invite both the assertive and sensitive sides to speak.
Example: “What feels most important to preserve for you in this situation?”

(d) Reframing in Their Language:
Balance acknowledgment of strength with validation of inner depth.
Example: “Your strength stands out, and it’s clear you care deeply about doing what’s right.”

(e) Joint Resolution Protecting Their Values:
Design solutions that preserve autonomy while affirming emotional needs.
Example: “Let’s find a way where your leadership holds strong, but everyone feels equally supported.”


C. CONCLUSION

Core Statement:
"I am tough, but understand my vulnerability."
`,
  },

  {
    id: '9',
    src: '/gallery/gallery9.jpg',
    title: 'Gentleman Scholar',
    description: `

A. OBSERVATION

The individual is wearing a white shirt paired with a brown tweed blazer, holding a cocktail glass in a social environment. This combination projects both intellect and sociability, suggesting a person who bridges the gap between formality and comfort — someone who appreciates refinement without rigidity.

Explicit Qualities:
Formality — reflected in the tweed blazer, signaling tradition, professionalism, and intellectual depth.
Comfort — visible through the open, relaxed fit of the blazer and shirt.
Social Engagement — implied by the cocktail, showing an ease in social settings and appreciation for cultured leisure.
Confidence — posture and styling convey self-assurance and composure.

Shadow Qualities:
Formality — hides a desire for freedom or casual spontaneity.
Comfort — conceals discipline, internal rules, and personal boundaries.
Sociability — may veil introversion or a private inner life.
Confidence — can mask uncertainty or overthinking beneath the calm exterior.

Contradictions and Core Inner Conflict:
Primary Contradiction:
Formality vs. Comfort — balancing intellectual refinement with the desire for relaxation and ease.
Supporting Contradiction:
Sociability vs. Solitude — the dual nature of enjoying interaction while craving space for reflection.

Balance of Underlying Contradictions (BUC):
Formality (External Structure) vs. Comfort (Inner Ease) — this duality defines the “Gentleman Scholar,” someone who embodies composure and intellect while maintaining authenticity and emotional warmth.

Bright and Hidden:
Bright — cultured, calm, articulate, socially adaptable.
Hidden — introspective, contemplative, self-protective.

Approximation:
Personal Style — Intellectual Ease: refined yet grounded.
Shadow Style — Private Scholar: thoughtful, occasionally distant.
Role — The Gentleman Scholar: a figure of composure and intellect, with an undercurrent of personal warmth and restraint.
Hidden Command — "I am approachable and sociable, but respect my need for personal space and comfort."
 


B. CONFLICT HANDLING APPROACH

Persona Calibration:
Engage this person with composure, courtesy, and intellect. They value calm, articulate communication that acknowledges both professionalism and human ease. Balance structure with empathy — too much rigidity will create distance, while excessive familiarity may break their sense of personal boundary.

Predicted Reactions and Triggers:
They are likely to respond well to conversations grounded in respect, thoughtfulness, and moderation.  
Triggers:
– Overly formal or bureaucratic tone (feels impersonal).  
– Excessive emotional pressure or lack of intellectual respect (feels intrusive).  
– Dismissal of their need for balance between work and comfort.

Best Opening Words:
"I appreciate your professionalism, and I can also see you value comfort and balance — let’s find a way to align both."

Finding the Root Cause:
Their internal conflict often revolves around maintaining poise and intellect while desiring relaxation or authenticity.  
Use reflective questions to expose this dynamic:  
– "What aspects of this feel too rigid or formal for you?"  
– "How can we make this feel more natural without losing structure?"

Reframing in Their Language:
Frame solutions in terms of balance and respect.  
Example:  
"It seems like you’re balancing being professional with staying comfortable. How can we make this situation serve both those needs?"

Joint Resolution Protecting Their Values:
Propose solutions that preserve intellectual dignity and personal ease:  
"Let’s find a path that maintains your standards while ensuring you feel at ease — something refined yet relaxed."

Motivators:
– Mutual respect and dignity in interactions.  
– Intellectual engagement and autonomy.  
– Environments that balance social connection with private reflection.


C. CONCLUSION

Core Statement:
"I am approachable and sociable, but respect my need for personal space and comfort."
`,
  },

  {
    id: '10',
    src: '/gallery/gallery10.jpg',
    title: 'Calm & Bold',
    description: `

A. OBSERVATION

The individual is wearing a light, loose-fitting beige shirt layered over a darker, fitted t-shirt. The choice of neutral tones conveys restraint and composure, while the contrasting dark inner layer introduces quiet strength. The combination suggests a person who values calm balance but possesses an inner readiness for bold action when needed.

Explicit Qualities:
Comfort — the loose outer shirt expresses ease, relaxation, and adaptability.
Neutrality — beige tones signify a desire for harmony, emotional balance, and discretion.
Subtlety — understated layering reflects sophistication without attention-seeking.
Composure — balanced color use and relaxed fit reveal calm confidence.

Shadow Qualities:
Discomfort — an ability to endure or accept challenges despite valuing ease.
Boldness — hidden assertiveness beneath neutrality, readiness to take risks when necessary.
Flashiness — suppressed wish for recognition or influence.
Intensity — quiet determination veiled by outward calm.

Contradictions and Core Inner Conflict:
Primary Contradiction:
Comfort and Neutrality vs. Discomfort and Boldness — the individual balances between serenity and the drive to act decisively.
Supporting Contradictions:
Subtlety vs. Recognition — modest presentation contrasted with an unspoken need to be seen.
Calmness vs. Intensity — emotional stillness layered over inner movement and intent.
Harmony vs. Action — a preference for stability coexisting with a need to challenge it when required.

Balance of Underlying Contradictions (BUC):
Comfort/Neutrality vs. Discomfort/Boldness — the equilibrium between ease and decisive courage.

Bright and Hidden:
Bright — calm, approachable, composed, grounded.
Hidden — bold, strategic, quietly determined.

Approximation:
Personal Style — Casual Elegance: comfortable sophistication with a balanced aesthetic.
Shadow Style — Quiet Authority: composed surface with deep capacity for strong action.
Visible Role — approachable and steady presence.
Hidden Role — bold decision-maker when required.
Hidden Command — "I am comfortable and neutral, but allow me to be bold when needed."
 


B. CONFLICT HANDLING APPROACH

Persona Calibration:
Engage this person in a calm and measured tone that respects their preference for comfort and balance. Maintain composure but be prepared for their capacity to assert themselves when the situation demands it. They respond best to environments where steadiness is preserved even when change is required.

Predicted Reactions and Triggers:
They are likely to respond thoughtfully at first, maintaining a calm demeanor. However, if their sense of comfort, autonomy, or competence is threatened, their bold side will emerge. They can shift from quiet observation to decisive intervention quickly.
Triggers include:
– Perceived loss of balance or safety.
– Feeling overlooked or undervalued.
– Situations where neutrality is dismissed as passivity.

Finding the Root Cause of a Conflict:
Use open-ended, reflective questions that invite them to describe emotional or situational imbalances.
Example: "What feels out of balance for you right now?" or "What’s creating pressure on your sense of comfort in this situation?"

Reframing in Their Language:
Acknowledge their need for calm while inviting constructive boldness.
Example: "I understand your preference for balance and stability, but let’s explore how we can introduce change that still feels centered."

Joint Resolution Protecting Their Values:
Design outcomes that preserve equilibrium but allow room for decisive progress.
Example: "Let’s find a solution that keeps everyone comfortable while giving us space to take confident action when the time is right."

Motivational Levers:
– Balance: emphasize fairness and stability.
– Trust: show reliability and respect for their process.
– Empowerment: encourage bold input framed within structured calm.


C. CONCLUSION

Core Statement:
"I am comfortable and neutral, but allow me to be bold when needed."
`,
  },

  {
    id: '11',
    src: '/gallery/gallery11.jpg',
    title: 'Clean & Private',
    description: `

A. OBSERVATION

The person is wearing a crisp white button-up shirt, symbolizing simplicity, cleanliness, and order. The shirt is neatly fastened, reflecting discipline and a preference for control. Sunglasses conceal the eyes, adding an element of mystery, coolness, and psychological distance. The ensemble presents a carefully managed image — calm, minimalistic, but guarded.

Explicit Qualities:
Cleanliness — preference for neatness and clarity, both visual and emotional.
Simplicity — attraction to straightforwardness and reduction of excess.
Orderliness — control, structure, and consistency in appearance and mindset.
Coolness — emotional restraint, self-possession.
Privacy — guardedness, self-protection, maintenance of boundaries.

Shadow Qualities:
Complexity — hidden layers of thought, emotion, or internal tension.
Disorder — unacknowledged chaos beneath outer order.
Warmth — repressed tenderness or emotional openness.
Openness — the unexpressed wish to be understood and seen beyond appearance.

Contradictions and Core Inner Conflict:
Primary Contradiction:
Cleanliness and Order vs. Complexity and Disorder — the balance between external precision and internal dynamism.
Supporting Contradictions:
Simplicity vs. Depth — straightforward appearance concealing inner richness.
Coolness vs. Warmth — composure balancing human connection.
Privacy vs. Openness — desire for solitude mixed with quiet longing for authenticity.

Balance of Underlying Contradictions (BUC):
Cleanliness vs. Complexity — maintaining external control while containing internal unpredictability.

Bright and Hidden:
Bright — clarity, composure, discipline, restraint.
Hidden — emotion, vulnerability, intellectual intricacy.

Approximation:
Personal Style — Minimalist Sophistication: refined restraint with functional elegance.
Shadow Style — Controlled Depth: emotional and intellectual intensity hidden behind precision.
Hidden Command — "I am simple and orderly, but allow me my privacy and complexity."
Role — The Refined Observer: watches closely, acts precisely, reveals little.
 


B. SALES PITCH TAILORING

Approach:
When addressing this person, emphasize precision, simplicity, and privacy. They appreciate products or services that streamline complexity rather than add to it. Present your offer as something that aligns with their preference for structure and control — elegant, useful, and discreet.

Tone:
Professional, calm, and factual. Avoid emotional exaggeration or forced enthusiasm. Instead, mirror their composed energy through measured pacing and clear language.

Words to Use:
"Clean", "simple", "structured", "refined", "exclusive", "streamlined", "confidential", "efficient".

Motivators:
– Efficiency: value of reducing chaos and maximizing clarity.  
– Privacy: assurance that their boundaries and data are respected.  
– Sophistication: subtle refinement, understated excellence.  
– Control: reinforcement of autonomy and stability.

Proof Strategy:
Provide evidence in clear, concise formats — simple data visuals, minimalistic visuals, or succinct case studies.  
Show how your product enhances structure and order while preserving discretion.  
Highlight privacy or data protection elements with quiet confidence rather than hype.

Avoid:
Overcomplicated explanations, emotional language, or high-energy presentations — these create dissonance with their preference for calm and order.

Ideal Line to Begin:
"Our approach focuses on simplicity and precision — enhancing your life without disrupting your privacy."

Ideal Line to Close:
"We built this to fit seamlessly into your structure — refined, efficient, and entirely your own."
 


C. CONCLUSION

Core Statement:
"I am simple and orderly, but allow me my privacy and complexity."
`,
  },

  {
    id: '12',
    src: '/gallery/gallery12.jpg',
    title: 'Relaxed & Focused',
    description: `

A. OBSERVATION

The person is sitting in a neutral-toned space, wearing a soft, minimal outfit — likely a loose white or beige shirt and dark trousers. The posture is casual yet attentive, eyes directed with calm concentration. The image evokes a combination of ease and alertness — a grounded calm paired with mental precision.

Explicit Qualities:
Relaxation — comfort in presence, openness to the moment.
Focus — steady gaze and intentional posture imply mental engagement.
Balance — the body language integrates physical ease with mental activity.
Simplicity — minimal clothing and subdued colors reflect clarity and practicality.
Confidence — quiet self-assurance without exaggeration or display.

Shadow Qualities:
Restlessness — underlying need to maintain calm under inner movement.
Rigidity — focus may verge into over-discipline or inflexibility.
Detachment — balance may mask emotional distance.
Overthinking — mental sharpness can lead to inner tension.
Passivity — calmness occasionally sliding into inertia.

Contradictions and Core Inner Conflict:
Primary Contradiction:
Relaxation vs. Focus — continuous negotiation between inner stillness and purposeful action.
Supporting Contradictions:
Calmness vs. Intensity — quiet surface concealing mental drive.
Presence vs. Detachment — connection to the moment balanced by intellectual distance.

Balance of Underlying Contradictions (BUC):
Ease vs. Precision — maintaining flow while ensuring control; the art of poised attention.

Bright and Hidden:
Bright — composure, control, presence.
Hidden — internal movement, self-monitoring, and restrained emotion.

Approximation:
Personal Style — Mindful Minimalism: calm, efficient, and aware.
Shadow Aspect — Silent Intensity: inner drive and focus concealed behind relaxation.
Synthesized Role — The Composed Strategist: effortlessly controlled, yet deeply engaged beneath the surface.

Hidden Command:
"Let me stay calm, but know that my mind is always in motion."
 


B. APPLICATION IN WORK AND INTERACTION

Work and Decision-Making:
Approaches work with quiet determination, preferring steady progress over bursts of activity.
Makes decisions through observation and reflection rather than impulse.
Thrives in stable, organized environments where attention to detail is valued.

Communication Style:
Speaks clearly, deliberately, without excess emotion.
Listens carefully and prefers meaningful dialogue over casual conversation.
May appear detached but is often deeply attentive beneath the calm demeanor.

Motivators:
Autonomy — needs control over time and pace.
Respect — values being recognized for consistency and reliability.
Meaning — seeks intellectual or emotional alignment with the work.

Risks:
Emotional Fatigue — constant self-regulation can lead to quiet exhaustion.
Isolation — preference for control may limit openness in teamwork.
Stagnation — comfort zone may prevent adaptive risk-taking.

Best Fit Environments:
Creative planning, research, design, or management roles requiring composure and focus.
Balanced teams that allow independence but reward presence and attentiveness.


C. CONCLUSION

Core Statement:
"Let me stay calm, but know that my mind is always in motion."
`,
  },
  {
    id: '13',
    src: '/gallery/gallery13.jpg',
    title: 'Bold & Calm',
    description: `

A. OBSERVATION

The artwork presents abstract, expressive brushstrokes dominated by strong hues of red, black, and yellow. The distorted human face conveys intensity, emotional charge, and psychological exploration. The composition feels dynamic yet contained, suggesting both chaos and deliberate control.

Explicit Qualities:
Boldness — appreciation for strength, courage, and vivid self-expression.
Emotional Depth — resonance with intense, layered emotional states.
Creativity — affinity for abstraction, freedom from convention, and individual perspective.
Confidence — comfort in confronting complexity and intensity directly.

Shadow Qualities:
Calmness — desire for stillness and equilibrium beneath outward intensity.
Rationality — need to balance emotion with logical structure and mental clarity.
Conformity — subtle attraction to order, despite a visible preference for freedom.

Contradictions and Core Inner Conflict:
Primary Contradiction:
Boldness vs. Calmness — constant motion between expressive energy and the search for peace.
Supporting Contradictions:
Emotion vs. Rationality — expressive intuition balanced by analytical awareness.
Creativity vs. Conformity — freedom challenging the pull toward structured form.

Balance of Underlying Contradictions (BUC):
Expression vs. Restraint — internal dynamic guiding the persona’s rhythm of action and reflection.

Bright and Hidden:
Bright — expressiveness, courage, and emotional openness.
Hidden — longing for calm, clarity, and structured thought.

Approximation:
Personal Style — Expressive Individual: bold presence and emotional authenticity.
Inner State — Complex Thinker: reflective, analytical, seeking harmony within inner chaos.

Completion:
The analysis reaches balance where the expressive exterior integrates with the introspective core.


B. HIDDEN COMMAND

Hidden Command:
"I am drawn to intensity and chaos, but allow me moments of peace and structure."
This expresses a desire for freedom in creative expression, tempered by a need for stability and mental order.
It reflects a psyche that thrives on movement but renews itself through stillness.


C. CONCLUSION

Core Statement:
"I am drawn to intensity and chaos, but allow me moments of peace and structure."
`,
  },
  {
    id: '14',
    src: '/gallery/gallery14.jpg',
    title: 'Versatile Steps',
    description: `

A. OBSERVATION

The person is walking down a staircase wearing a beige trench coat, dark pants, and clean white sneakers. The combination of formal outerwear and casual footwear suggests adaptability — a capacity to transition between structured and relaxed contexts with ease.

Explicit Qualities:
Adaptability — the blend of formal and casual elements demonstrates flexibility in presentation.
Confidence — steady posture and controlled movement indicate self-assurance.
Functionality — choice of sneakers underlines comfort and practicality.
Elegance — trench coat contributes to sophistication and composure.
Balance — natural movement and proportion reflect emotional equilibrium.

Shadow Qualities:
Restlessness — frequent adaptation may mask a subtle unease with stillness.
Perfectionism — attention to coordination may reflect internal pressure for order.
Independence — autonomy sometimes leading to isolation or over-reliance on self.
Inconsistency — fluidity can evolve into indecision when boundaries blur.
Control — a hidden need to maintain balance through careful presentation.

Contradictions and Core Inner Conflict:
Primary Contradiction:
Formality vs. Relaxation — navigating between structure and freedom in both appearance and behavior.
Supporting Contradictions:
Confidence vs. Vulnerability — calm composure balancing inner uncertainty.
Adaptability vs. Consistency — movement between flexibility and the desire for stable identity.

Balance of Underlying Contradictions (BUC):
Structure vs. Freedom — core equilibrium defining the persona’s rhythm of expression and restraint.

Bright and Hidden:
Bright — composed, balanced, flexible, and socially fluid.
Hidden — perfectionism, internal tension, need for stability under constant movement.

Approximation:
Personal Style — Structured Fluidity: poised, balanced, comfortable in transition.
Synthesized Role — The Adaptive Navigator: capable of harmonizing formal precision with relaxed spontaneity.

Hidden Command:
"Allow me to move freely, yet respect my need for control."
 


B. APPLICATION TO WORK AND INTERACTION

Work and Collaboration Profile:
Performs best in environments that value flexibility, evolution, and multidimensional roles.
Thrives in positions that involve coordination, design, or negotiation — where transitions between order and creativity are frequent.

Communication and Management Style:
Communicates with measured tone and calm focus.
Responds best to leadership that offers autonomy but defines clear direction.
Finds motivation in projects that allow learning, change, and refined execution.

Strengths:
Versatility — adapts to dynamic environments without losing composure.
Empathy — natural sensitivity to varying social or creative contexts.
Reliability — despite movement, maintains structural balance in output.

Risks:
Overextension — taking on too many roles or contexts may cause inner fragmentation.
Emotional Fatigue — constant balancing can lead to quiet exhaustion.
Undervaluation — subtle, adaptable personas may be overlooked in high-intensity teams.

Motivational Approach:
Encourage periodic grounding and reflection.
Provide both creative space and a defined framework.
Recognize adaptability as a strategic strength, not just flexibility.


C. CONCLUSION

Core Statement:
"Allow me to move freely, yet respect my need for control."
`,
  },
  {
    id: '15',
    src: '/gallery/gallery15.jpg',
    title: 'Raffia Balance',
    description: `

A. OBSERVATION

The person is wearing a light raffia-textured hat, a white shirt, and neutral-toned trousers. The natural materials and earthy color palette suggest calmness, simplicity, and connection to organic environments. The posture appears relaxed yet deliberate, indicating balance between awareness and ease.

Explicit Qualities:
Naturalness — preference for organic textures and simplicity in form.
Calmness — neutral tones convey serenity and emotional steadiness.
Balance — refined coordination of elements suggests harmony between thought and feeling.
Practicality — clothing choices prioritize comfort and function without losing aesthetics.
Groundedness — connection to natural materials reflects authenticity and presence.

Shadow Qualities:
Restlessness — hidden movement beneath calm surface; difficulty staying still for long.
Intensity — emotional or intellectual depth behind understated appearance.
Perfectionism — the pursuit of balance might conceal subtle control tendencies.
Disconnection — risk of becoming overly self-contained, avoiding chaos or emotion.
Rigidity — potential to over-structure life to preserve peace.

Contradictions and Core Inner Conflict:
Primary Contradiction:
Naturalness vs. Control — tension between effortless calm and the internal need to maintain it.
Supporting Contradictions:
Calmness vs. Intensity — visible stillness balanced by hidden emotional charge.
Simplicity vs. Perfectionism — appreciation of ease countered by pursuit of precision.

Balance of Underlying Contradictions (BUC):
Calmness vs. Intensity — equilibrium that defines the persona: quiet harmony with subtle inner motion.

Bright and Hidden:
Bright — visible composure, connection to nature, balanced minimalism.
Hidden — quiet determination, emotional fire, and perfectionist undercurrent.

Approximation:
Personal Style — Organic Balance: effortless elegance through natural textures and proportion.
Synthesized Role — The Grounded Idealist: pragmatic in presentation, introspective in essence.

Hidden Command:
"I seek calm in form but carry depth beneath the surface."
 


B. INTERACTION AND ENVIRONMENTAL FIT

Optimal Work and Collaboration Style:
Thrives in environments that are visually calm and emotionally balanced.
Performs best where design, nature, and mindfulness intersect — spaces that value detail and clarity.
Prefers autonomy and calm rhythm over high-stimulation, reactive settings.

Communication Preferences:
Responds to clarity, warmth, and genuine tone.
Avoids noise and rushed exchanges — values pauses and reflection.
Respects balanced dialogue where every viewpoint is heard before conclusions are drawn.

Risks and Triggers:
May resist abrupt changes that disrupt equilibrium.
Can overanalyze or withdraw when emotional intensity rises beyond control.
Risk of internal burnout if balance maintenance becomes perfection-driven.

Motivators:
Harmony — driven by inner alignment and external coherence.
Purpose — seeks meaning in even the smallest acts or designs.
Respect — responds positively to mutual recognition and calm collaboration.


C. CONCLUSION

Core Statement:
"I seek calm in form but carry depth beneath the surface."
`,
  },
  {
    id: '16',
    src: '/gallery/gallery16.jpg',
    title: 'Grounded Depth',
    description: `

A. OBSERVATION

The person is seated on a rock by the ocean, wearing a white t-shirt and dark pants. The visible tattoo on the left arm adds individuality and narrative depth to the overall simplicity of the attire. The surrounding environment — natural, open, and raw — amplifies the sense of calm introspection.

Explicit Qualities:
White T-shirt — cleanliness, simplicity, openness, purity of intention.
Dark Pants — practicality, seriousness, grounded presence.
Tattoo — individuality, personal history, emotional expression, or inner narrative.
Posture — stability, contemplation, awareness of surroundings.

Shadow Qualities:
Cleanliness — hidden complexity beneath apparent simplicity.
Practicality — quiet idealism or imaginative depth behind functional presentation.
Individuality — capacity to blend in when needed; adaptive expression.
Seriousness — latent vulnerability, reflective temperament, or emotional sensitivity.

Contradictions and Core Inner Conflict:
Primary Contradiction:
Simplicity vs. Complexity — external calm concealing internal reflection and emotional sophistication.
Supporting Contradictions:
Practicality vs. Idealism — balance between tangible action and abstract thought.
Groundedness vs. Depth — simultaneous connection to the present and inner exploration.

Balance of Underlying Contradictions (BUC):
Cleanliness vs. Complexity — the key dynamic; simplicity in form containing intricate depth in essence.

Bright and Hidden:
Bright — the calm, practical, grounded persona visible in simplicity.
Hidden — creative depth, sensitivity, introspection, and conceptual richness.

Approximation:
Explicit Qualities Approximation — Simplicity + Practicality = Groundedness.
Shadow Qualities Approximation — Complexity + Idealism = Depth.

Synthesized Role:
Explicit — Grounded Individualist: stable, composed, authentically present.
Shadow — Deep Thinker: inwardly reflective, analytical, and emotionally intelligent.

Hidden Command:
"I am simple and practical, but understand there's more depth to me than meets the eye."
 


B. APPLICATION TO TEAM DYNAMICS

Belbin Team Role Mapping:
Primary Role — Plant: creative, original, concept-oriented problem solver.
Secondary Role — Completer Finisher: detail-oriented, conscientious, dependable in follow-through.

Optimal Utilization in a Team:
As Plant — leverage this person’s innovative capacity and ability to see beyond the surface. Assign ideation, conceptualization, or early-stage strategy development tasks.
As Completer Finisher — rely on their precision, reliability, and self-discipline for ensuring polished execution and timely completion.

Team Integration Insight:
They perform best when given autonomy, space for reflection, and intellectually stimulating tasks.
They lose motivation if confined to repetitive, low-challenge work or rigid environments.

Risk Indicator:
Risk of disengagement if creativity is underutilized or routine dominates their work environment.
Potential internal conflict between idealism and pragmatism, which may cause hesitation in high-pressure decisions.

Leadership Note:
Provide freedom balanced with structured deadlines — this sustains their grounded productivity and creative flow.


C. CONCLUSION

Core Statement:
"I am simple and practical, but understand there's more depth to me than meets the eye."
`,
  },
  {
    id: '17',
    src: '/gallery/gallery17.jpg',
    title: 'Strength & Trust',
    description: `

A. OBSERVATION

Person 1 (left): Wearing swim trunks, muscular build, in water, supporting another person.
Person 2 (right): Wearing a black bikini, long hair, standing on Person 1’s shoulders in water.

Explicit Qualities:
Person 1 (left): Strength, supportiveness, physical reliability.
Person 2 (right): Confidence, playfulness, physical balance and trust.

Shadow Qualities:
Person 1 (left): Vulnerability, emotional sensitivity, need for recognition.
Person 2 (right): Dependence, desire for reassurance, fear of instability.

Contradictions and Core Inner Conflict:
Person 1 (left): Strength vs. Vulnerability — balancing physical dominance with emotional openness.
Person 2 (right): Confidence vs. Dependence — balancing self-assured leadership with a need for grounded support.

Bright and Hidden:
Person 1 (left): Bright — strength; Hidden — vulnerability.
Person 2 (right): Bright — confidence; Hidden — dependence.

Approximation:
Person 1 (left): Protector archetype — provides stability and power but quietly seeks emotional connection.
Person 2 (right): Visionary archetype — projects confidence while needing a reliable base of trust.

Synthesis:
Person 1 (left): A strong individual who channels strength into care, finding validation through acts of protection.
Person 2 (right): A confident individual who relies on trust to maintain balance, both literally and emotionally.

Hidden Command:
Person 1 (left): "Show me your strength, but let me be vulnerable."
Person 2 (right): "Let me lead, but provide me with stability."
 

B. ADDRESSING MOTIVATORS AND EVOLUTION

Primary Motivators:
Person 1 (left): Recognition, emotional connection, and physical challenge.
Person 2 (right): Leadership, trust, and creative playfulness.

Evolution Over Time:
Person 1 (left): Growth occurs through reconciling strength with vulnerability — learning that allowing emotional openness deepens authentic relationships and self-acceptance.
Person 2 (right): Growth unfolds through balancing independence with interdependence — maintaining confidence while fostering supportive dynamics that enhance stability.

Dynamic Interdependence:
Together, they represent the dual movement between power and trust — each depending on the other’s balance to sustain harmony and cooperation.


C. CONCLUSION

Person 1 (left): "Show me your strength, but let me be vulnerable."
Person 2 (right): "Let me lead, but provide me with stability."
`,
  },

  {
    id: '18',
    src: '/gallery/gallery18.jpg',
    title: 'Comfort x Style',
    description: `

A. OBSERVATION

Appearance Analysis:
The individual is dressed in a casual, sporty manner with a black jacket, hoodie, jeans, and distinctive tan sneakers. This suggests a blend of comfort and style, indicating a preference for practicality and a touch of individuality.

Explicit Qualities:
Comfort — the hoodie and jeans suggest a preference for ease and relaxation.
Practicality — the black jacket and jeans are practical for various activities, especially in an outdoor setting like a basketball court.
Individuality — the tan sneakers stand out, indicating a desire to express personal style.

Shadow Qualities:
Comfort — may indicate resistance to discomfort or challenge.
Practicality — could suggest a fear of chaos or lack of control.
Individuality — might hide a desire for conformity or acceptance.

Contradictions:
Comfort vs. Individuality — the comfort of the outfit contrasts with the standout sneakers, reflecting a balance between blending in and standing out.
Practicality vs. Style — the functional clothing paired with stylish sneakers indicates a dynamic between usefulness and personal expression.

Core Inner Conflict:
Comfort vs. Individuality — balancing the need for ease with the desire to be unique.

Personal Style:
Casual, sporty, with a hint of streetwear influence, suggesting a laid-back yet expressive personality.

Accessory Profiling:
The sneakers are the key accent, serving as the main expression of individuality.

Synthesis of Profiles:
The individual balances comfort and individuality, practicality and style, reflecting a persona that values ease but also seeks to express uniqueness.

Hidden Command:
"Let me be comfortable, but allow me to stand out."


B. PREDICTED REACTIONS & TRIGGERS

Predicted Reactions:
Likely to respond positively to interactions that respect their comfort while acknowledging their individuality. May be triggered by situations that disrupt their ease without recognising their expressive side.

Conflict-Handling Approach:
Persona Calibration — approach with a casual, friendly tone that respects comfort while subtly highlighting individuality.

Predicted Reactions & Triggers:
They tend to appreciate direct yet empathetic dialogue, avoiding confrontational or overly formal communication.

How to Find the Root Cause:
Ask open-ended questions that let them express how the issue affects both their comfort and their individuality.

How to Reframe in Their Language:
Use phrases such as:
"I see you value your comfort, but you also like to stand out. Let's find a solution that respects both."

Joint Resolution Protecting Their Values:
Propose solutions that preserve comfort and individuality simultaneously, ensuring they feel both understood and valued.


C. CONCLUSION

The individual balances comfort and individuality, practicality and style — a persona that values ease but also seeks to express uniqueness.
`,
  },

  {
    id: '19',
    src: '/gallery/gallery19.jpg',
    title: 'Natural Elegance',
    description: `

A. OBSERVATION

The person is wearing a black top and has long, wavy blonde hair. The background features a historical building, which is excluded from analysis for focus on personal presentation.

Explicit Qualities:
Black Top — practicality, simplicity, understated confidence.
Long, Wavy Blonde Hair — naturalness, freedom, a touch of glamour.

Shadow Qualities:
Practicality — may conceal complexity or hidden sophistication.
Simplicity — may hide intricacy and intellectual depth.
Naturalness — may mask intentional control or careful self-curation.
Freedom — balanced by restraint and self-discipline.
Glamour — balanced by subtlety and quiet composure.

Contradictions and Core Inner Conflict:
Primary Contradiction — Simplicity vs. Glamour.
Shadow Contradiction — Complexity vs. Subtlety.
Balance of Underlying Contradictions (BUC) — Simplicity (explicit) vs. Complexity (shadow).

Bright and Hidden:
Bright — Glamour (hair, natural confidence).
Hidden — Practicality (clothing, restraint in self-expression).

Approximation:
Explicit — Natural Elegance, combining organic expression and understated allure.
Shadow — Controlled Complexity, a harmony between freedom and structure.

Completion:
The analysis is complete when both visible simplicity and hidden intricacy are unified into one coherent image.

Empathy:
Wearing this ensemble suggests a person who seeks to remain grounded while allowing natural beauty and quiet charisma to surface.

Avoiding Stereotypes:
Interpretation focuses on authentic presentation rather than generalized assumptions.
 


B. APPLICATION AND RISKS

Innovation and Creativity Potential:
7 / 10 — The blend of natural grace and structured restraint indicates creative potential, particularly in areas merging aesthetics and strategy.

How to Work with It:
Encourage environments that allow balance between structure and creative freedom.  
Enable space for exploration — combining practicality with artistic intuition will enhance their output and satisfaction.

Risks:
Internal tension between simplicity and complexity may manifest as indecision or creative overthinking.  
Risk of overemphasizing appearance or presentation at the expense of underlying content or meaning.  
Potential to oscillate between minimalism and over-refinement if not consciously balanced.


C. CONCLUSION

Explicit Essence:
Natural Elegance — merging authenticity, grace, and quiet glamour with an underlying layer of controlled complexity.
`,
  },

  {
    id: '20',
    src: '/gallery/gallery20.jpg',
    title: 'Comfort & Intellect',
    description: `

A. OBSERVATION

Appearance Analysis:
The person is wearing a casual, comfortable outfit consisting of a crop top and loose pants, with an open shirt over it. This suggests qualities of comfort, ease, and a relaxed demeanor. The black and white photo adds a layer of simplicity and timelessness.

Accessory Analysis:
The person is wearing glasses, which can indicate a need for clarity or intellectualism. The ring on the finger might suggest a sense of individuality or personal significance.

Visible Qualities:
Comfort, ease, simplicity, intellectualism, individuality.

Shadow Qualities:
Discomfort, rigidity, complexity, emotionalism, conformity.

Contradictions:
There is a contrast between the relaxed, comfortable attire and the intellectual accessory (glasses), suggesting a balance between physical ease and mental engagement.

Core Inner Conflict:
Comfort vs. Intellectualism.

Personal Style:
Casual yet thoughtful, blending comfort with a touch of sophistication.

Hidden Command:
"Understand my need for comfort while engaging my intellect."

Intrinsic Motivation:
Seeking a balance between physical relaxation and mental stimulation, valuing both personal comfort and intellectual growth.


B. PREDICTED REACTIONS & TRIGGERS

Conflict Handling Approach:
Given the persona's blend of comfort and intellectualism, approach conflicts with a calm, understanding tone that respects their need for ease while engaging their mind.

Predicted Reactions & Triggers:
They might react positively to discussions that allow them to feel at ease but could be triggered by situations that feel too confrontational or intellectually dismissive. They value understanding and might be motivated by intellectual solutions.

How to Find the Root Cause:
Ask open-ended questions that encourage them to express both their emotional and intellectual perspectives.
Example: "What do you feel is the core issue here, and what do you think logically should be done?"

How to Reframe in Their Language:
Use language that acknowledges their comfort while stimulating their intellect.
Example: "Let's find a solution that keeps us both at ease while also being smart about it."

Joint Resolution Protecting Their Values:
Propose solutions that maintain a relaxed environment but also provide intellectual satisfaction.
Example: "We can resolve this by taking a break to think it through, then coming back with clear, thoughtful ideas."

Best Opening Words:
"Let's approach this calmly and thoughtfully, ensuring we both feel comfortable and engaged."


C. CONCLUSION
Seeking a balance between physical relaxation and mental stimulation, valuing both personal comfort and intellectual growth.
`,
  },

  {
    id: '21',
    src: '/gallery/gallery21.jpg',
    title: 'Free within Form',
    description: `

A. OBSERVATION

The person is wearing a long checkered coat, light-colored pants, and carrying a black bag. Hair is long and wavy, conveying naturalness and freedom balanced by composure. The combination of classic attire and relaxed styling suggests the interplay between structure and ease.

Explicit Qualities:
Checkered Coat — classicism, timelessness, appreciation of order.
Light-Colored Pants — lightness, simplicity, comfort.
Long Wavy Hair — freedom, natural flow, unforced individuality.

Shadow Qualities:
Classicism — rebellion, quiet modernity.
Lightness — depth, intellectual complexity.
Freedom — structure, self-discipline, internal framework.

Contradictions and Core Inner Conflict:
Primary Contradictions:
Classic Style vs. Modernity
Lightness vs. Depth
Freedom vs. Structure

Balance of Underlying Contradictions (BUC):
Freedom vs. Structure — the essential axis of balance. The person embodies freedom of expression within a framework of classical structure and elegance.

Approximation:
Explicit Essence — Classic, Light, Free.
Shadow Essence — Modern, Deep, Structured.
Synthesized Role — A personality that harmonizes traditional refinement with modern fluidity, integrating creative freedom within self-imposed discipline.

Completion:
The analysis achieves coherence when the visible freedom aligns with an invisible structure that supports it.
 


B. PROFILING OF ACCESSORIES AND DEVELOPMENT POTENTIAL

Accessory Profiling:
Black Bag — practicality and discipline, symbolizing organization and reliability. It introduces balance and control into an otherwise airy and free-flowing aesthetic.

Synthesis of Results:
The combination of structured elements (coat, bag) and fluid expressions (hair, posture) reflects a duality — valuing both liberation and order. This equilibrium suggests emotional maturity, a thoughtful approach to self-expression, and aesthetic intelligence.

Hidden Command:
"I am free and light, but allow me to maintain structure and control where necessary."

Personal Development Potential:
Given the central conflict Freedom vs. Structure, growth lies in integrating these polarities consciously. By establishing inner frameworks that enable rather than restrict, this person can expand both creative freedom and personal stability.

Approach for Development:
Encourage conscious structure — routines or principles that amplify rather than constrain creative flow.
Promote the concept of “freedom within form” — discipline as a vehicle for deeper autonomy.

Guiding Words:
Balance, Harmony, Integration, Freedom within Structure, Structured Creativity.

Motivators:
Personal Growth — showing that form enhances freedom.
Creativity — structure as a vessel for innovation.
Control — fostering purposeful direction while preserving individuality.
 

C. CONCLUSION

Core Statement:
"I am free and light, but allow me to maintain structure and control where necessary."
`,
  },

  {
    id: '22',
    src: '/gallery/gallery22.jpg',
    title: 'Graceful Simplicity',
    description: `

A. OBSERVATION

The person is wearing a white, strapless, fitted top and white, wide-legged pants. The outfit is simple and elegant, suggesting a preference for minimalism and purity.

Explicit Qualities:
Purity — the white color represents a desire for clarity, simplicity, and order.
Elegance — the strapless top and wide-legged pants convey refinement and poise.
Comfort — the soft fabric and loose fit indicate ease and freedom of movement.

Shadow Qualities:
Complexity — opposing purity, suggesting an unseen emotional or intellectual depth.
Casualness — opposing elegance, hinting at a relaxed, spontaneous nature.
Discomfort — opposing comfort, reflecting a willingness to endure challenges when necessary.

Contradictions and Core Inner Conflict:
Purity vs. Complexity — the dominant inner polarity, representing simplicity balanced with depth.
Elegance vs. Casualness — balance between controlled presentation and natural ease.
Comfort vs. Discomfort — balance between seeking ease and embracing challenge.

Approximation:
Personal Style — "Graceful Simplicity" with an undercurrent of introspection and quiet strength.
Accessory Profiling — no visible accessories; simplicity itself is the statement.

Synthesis of Results:
The individual balances simplicity and depth, elegance and ease, comfort and effort — reflecting a persona that values aesthetic clarity while carrying inner complexity.

Hidden Command:
"I am pure and elegant, but understand my depth and complexity."

Synthesized Role:
"Graceful Sage" — one who presents serene simplicity outwardly, yet embodies subtle depth and wisdom within.
 

B. JOB SUITABILITY

Best Fit Jobs:
Art Curator — aligns with elegance and minimalism, allowing for nuanced exploration of creative depth.
Yoga Instructor — merges comfort, purity, and graceful movement, expressing harmony between body and mind.
Fashion Designer — channels simplicity and elegance into structured creativity with room for deeper conceptual exploration.

Unsuitable Jobs:
Heavy Machinery Operator — lacks refinement, comfort, and aesthetic sensitivity.
Sales Representative — demands extroversion and informality, conflicting with poised presentation.
Corporate Lawyer — environment may feel overly rigid and complex, contrary to their preference for clarity and serenity.


C. CONCLUSION

Synthesized Role: 
"Graceful Sage" — someone who embodies pure, elegant simplicity on the surface, yet holds a profound and complex inner world.
`,
  },

  {
    id: '23',
    src: '/gallery/gallery23.jpg',
    title: 'Minimalist Poise',
    description: `

A. OBSERVATION

Clothing: White blazer over a white t-shirt with black text.  
Accessories: Sunglasses, small earrings.  
Hair: Blonde, straight, and well-groomed.  
Posture: Relaxed, sitting at a table.

Explicit Qualities
- Cleanliness — preference for simplicity.  
- Minimalism — monochromatic design.  
- Confidence — wearing sunglasses, blazer.  

Shadow Qualities
- Complexity — minimalist exterior hides depth.  
- Vulnerability — confidence masks fear of exposure.  

B. CONTRADICTIONS
Cleanliness vs Complexity
Confidence vs Vulnerability

Synthesis
The Iceberg: what you see is just the tip — there’s more beneath.

Unconscious Decision-Making
Intuitive decision-making based on inner sense of balance.  

Risks
- Confirmation Bias  
- Overconfidence Bias  
- Hidden Complexity Risk  

C. CONCLUSION
Synthesized Role: The Iceberg — what you see is just the tip, with much more beneath the surface.
`,
  },
  {
    id: '24',
    src: '/gallery/gallery24.jpg',
    title: 'Edge & Whimsy',
    description: `

A. OBSERVATION

The person is wearing a combination of a leather jacket and a tulle skirt, suggesting a blend of toughness and delicacy.

Leather Jacket:
Indicates a sense of toughness, practicality, and perhaps a desire for control or protection.

Tulle Skirt:
Represents delicacy, femininity, and a sense of freedom or whimsy.

Explicit Qualities:
Toughness — from the leather jacket, suggesting strength and resilience.
Delicacy — from the tulle skirt, reflecting softness and sensitivity.
Contrast — the combination highlights a person who embraces opposites, revealing a complex personality.

Shadow Qualities:
Toughness — may conceal vulnerability or emotional sensitivity.
Delicacy — might hide inner strength and assertiveness.

Contradictions and Core Inner Conflict:
Toughness vs. Delicacy — the primary dynamic, representing balance between strength and softness.
Balance of Underlying Contradictions (BUC): navigating between assertiveness and sensitivity in different contexts.

Approximation:
Personal Style — a mix of edgy and romantic, valuing both strength and beauty.
Completion — achieved when the dual aspects are coherently understood.

Synthesis of Profiles:
Projection — this person might project both strength and sensitivity, seeking acknowledgment for both.
Contradictions — needs to balance toughness with delicacy across situations.
Gender Specifics — as a woman, she may lean into shadow traits in emotional or personal contexts.

Hidden Command:
"I am strong yet delicate; treat me with respect for both aspects."

From Accessory Interpretation:
The tulle skirt reflects a desire for freedom and expression.
The leather jacket conveys a need for control and self-protection.

Message Formation:
Object — meeting setting.
Key Words — tough, delicate, expressive.
Format — a context that reflects both resilience and creativity.


B. BUSINESS INTERACTION

Best Meeting Setting:
An informal yet stylish environment — such as a creative studio or a modern café — allowing for authenticity and expressive dialogue.

Details that Matter & Why:
Leather Jacket — suggests preference for direct, respectful communication.
Tulle Skirt — indicates appreciation for creativity and aesthetic nuance.
Contrast — she values depth and layered meaning, so discussions should balance professionalism with personal connection.

Tailored Icebreaker:
"I love how your style blends toughness with a touch of whimsy. It reminds me of how creativity often emerges from contrast. What inspires your unique approach to style?"

First Transition into Business:
"Given your blend of strength and creativity, I think you'd connect well with this project. It demands both a strong structure and an imaginative edge."

Cold-Reaction Scenario & Recommended Response:
If she appears reserved or disengaged:
"I understand if this isn’t the right moment, but I genuinely believe our project aligns with your sense of both strength and beauty. Perhaps we can reconnect when the timing feels right?"


C. CONCLUSION

"I am strong yet delicate; treat me with respect for both aspects."
`,
  },

  {
    id: '25',
    src: '/gallery/gallery25.jpg',
    title: 'Casual Boldness',
    description: `

A. OBSERVATION

The person is wearing a white, loose-fitting outfit — shirt and pants — paired with a bright pink scarf. The overall composition reflects comfort, elegance, and a conscious statement of individuality.

Explicit Qualities:
White Outfit — cleanliness, simplicity, and refined composure.
Loose Fit — freedom, comfort, and ease in self-expression.
Bright Pink Scarf — boldness, confidence, and expressive individuality.

Shadow Qualities:
Cleanliness — may conceal hidden complexity or emotional depth.
Freedom — may mask a quiet desire for control or internal order.
Boldness — may hide subtlety or a need for privacy and emotional protection.

Contradictions and Core Inner Conflict:
Explicit Contradiction — Freedom vs. Boldness (the wish to stand out while remaining comfortable and authentic).
Shadow Contradiction — Complexity vs. Subtlety (hidden depth versus reserved privacy).
Cross Contradiction — Cleanliness vs. Complexity (an outer simplicity concealing an intricate inner world).

Balance of Underlying Contradictions (BUC):
Freedom vs. Desire for Structure — the person balances independence with a need for gentle boundaries that preserve clarity and direction.

Bright and Hidden:
Bright — The pink scarf, signaling bold individuality and a will to be seen.
Hidden — The neutral simplicity of the white outfit, reflecting introspection and inner restraint.

Approximation:
Explicit Style — Casual elegance with a touch of bold self-expression.
Shadow Style — Complex individuality, valuing privacy yet containing emotional depth.

Completion:
The analysis is coherent once the tension between freedom and control, simplicity and depth, is reconciled as a unified personal aesthetic.

Empathy:
Wearing this outfit represents a person at ease with comfort yet seeking distinctiveness, harmonizing visibility with self-containment.

Avoiding Stereotypes:
Interpretation remains faithful to expression, free of generic assumptions.

Limitations:
Interpretation based purely on visible attire; environmental and contextual factors are excluded.
 

B. INTRINSIC DRIVERS, COLLABORATION RISKS, AND TACTICS

Intrinsic Drivers:
Freedom vs. Structure — ongoing drive to maintain autonomy while navigating necessary organization.
Complexity vs. Simplicity — seeking clarity without sacrificing emotional or intellectual depth.

Key Collaboration Risks:
Without behavioral context, precise interpersonal risks cannot be fully defined. However, over-structuring collaboration could trigger resistance or disengagement, while complete freedom may reduce focus.

Most Effective Collaboration Tactic:
Provide autonomy within defined parameters — a structured framework that enables creative independence and personal ownership while preserving project coherence and stability.
Recognize their individuality in communication; emphasize mutual flexibility and clear boundaries.


C. CONCLUSION

Explicit Style:
Casual elegance with a touch of boldness — the embodiment of comfort, individuality, and refined self-expression balanced with inner depth.
`,
  },

  {
    id: '26',
    src: '/gallery/gallery26.jpg',
    title: 'Cozy Explorer',
    description: `

A. OBSERVATION

The person is wearing a green puffer vest over a white sweatshirt, paired with grey sweatpants. They are seated in a convertible car, holding a coffee cup, with a scenic background of mountains and trees.

Explicit Qualities:
Comfort: The choice of casual, comfortable clothing like a sweatshirt and sweatpants suggests a preference for comfort.
Practicality: The puffer vest indicates a practical approach to dressing for weather conditions.
Relaxed: The overall casual attire and relaxed posture suggest a laid-back personality.
Nature Appreciation: The scenic background might hint at an appreciation for nature, though this is not directly from the clothing.

Shadow Qualities:
Discomfort: The comfort in clothing might suggest a shadow quality of dealing with discomfort or challenges.
Impracticality: The practicality might hide a desire for spontaneity or less structured environments.
Intensity: The relaxed demeanor might conceal a more intense or driven side.

Contradictions and Core Inner Conflict:
Comfort vs. Discomfort: The person balances comfort with the ability to handle discomfort.
Practicality vs. Impracticality: There’s a balance between being practical and desiring spontaneity.
Relaxed vs. Intensity: The relaxed exterior might cover an intense inner drive.

Approximation:
Personal Style: Casual, practical, and nature-oriented.
Role: Adventurous Explorer — combining comfort, practicality, and a love for nature.


B. JOB SUITABILITY

Best Fit Jobs:
Outdoor Adventure Guide: Aligns with the nature appreciation and practical, comfortable attire.
Travel Blogger or Vlogger: Combines the relaxed style with the potential for adventure and sharing experiences.
Environmental Consultant: Fits the nature appreciation and practical approach, focusing on environmental issues.

Unsuitable Jobs:
Corporate Lawyer: Requires a formal, intense environment which contrasts with the person’s relaxed and practical nature.
Stockbroker: High-stress, fast-paced environment that might not suit the comfort and relaxed demeanor.
Factory Worker: Typically involves repetitive, structured tasks that might not align with the desire for spontaneity and nature.


C. CONCLUSION

Role: Adventurous Explorer — combining comfort, practicality, and a love for nature.
`,
  },

  {
    id: '27',
    src: '/gallery/gallery27.jpg',
    title: 'Playful Depth',
    description: `

A. OBSERVATION

Clothing: Brown sleeveless turtleneck, which suggests a sense of sophistication and simplicity.
Accessories: Hair clips (butterfly-shaped), small earrings, and a cross necklace. These accessories indicate a blend of playful creativity and a touch of spirituality or tradition.
Hair: Blonde, wavy hair with a casual yet styled look, adding to the playful and creative vibe.

Explicit Qualities:
Sophistication — from the turtleneck.
Playfulness — from the butterfly hair clips.
Simplicity — from the color and style of the clothing.
Spirituality / Tradition — from the cross necklace.

Shadow Qualities:
Sophistication → Casualness or Nonchalance.
Playfulness → Seriousness or Focus.
Simplicity → Complexity or Depth.
Spirituality / Tradition → Modernity or Rebellion.

Contradictions and Core Inner Conflict:
Sophistication vs. Playfulness.
Simplicity vs. Complexity.
Balance of Underlying Contradictions (BUC): Playfulness vs. Seriousness — this person balances a light-hearted, creative approach with a deeper, more focused side.

Bright and Hidden:
Bright: Playfulness (expressed through butterfly hair clips).
Hidden: Seriousness (implied by the simplicity and sophistication of the outfit).

Approximation:
Explicit: Creative Simplicity — combining playfulness with sophisticated simplicity.
Shadow: Focused Depth — seriousness and complexity beneath the surface.

Completion:
The analysis is complete when the person’s qualities and style are coherently synthesized.

Additional Rules:
Empathy — imagining oneself in this attire suggests a balance between wanting to express creativity and maintaining a grounded, sophisticated image.
Avoiding Stereotypes — focus on the unique combination of elements rather than generic interpretations.

Limitations:
Analysis is based on visible elements; no assumptions are made beyond what is seen.


B. APPLICATION AND RISKS

Potential for Innovation and Creativity:
Level: 7 / 10 — the combination of playful accessories with sophisticated clothing suggests a good balance of creativity and practicality, conducive to innovative thinking.

How to Work with It:
Encourage environments where creativity can be expressed freely but within structured frameworks. This person might thrive in roles where they can blend traditional elements with modern, creative solutions.

Risks:
Risk of Over-Simplification — might overlook complex details in favor of simplicity.
Risk of Distraction — the playful side might lead to a lack of focus if not balanced with the serious aspect.


C. CONCLUSION

Explicit: Creative Simplicity — combining playfulness with a sophisticated simplicity.
`,
  },

  {
    id: '28',
    src: '/gallery/gallery28.jpg',
    title: 'Practical Flair',
    description: `

A. OBSERVATION

The individual is dressed in a beige quilted bucket hat, a beige oversized belted jacket, black gloves, and carries a backpack. The overall image conveys a synthesis of utility and aesthetic awareness — function blended with personal style.

Explicit Qualities:
Practicality — the oversized jacket and backpack signal focus on utility and preparedness.
Style — coordinated tones and textures suggest aesthetic discernment.
Comfort — loose fit implies ease and physical freedom.
Individuality — distinctive combinations reveal a subtle desire for differentiation.

Shadow Qualities:
Impracticality — oversized garments may reflect nonconformity to strict function.
Conformity — mainstream items subtly indicate social blending despite individuality.
Discomfort — gloves introduce preparedness for challenge or exposure to discomfort.
Uniformity — monochrome palette might signify restraint or understated alignment.

Contradictions and Core Inner Conflict:
Primary Contradictions:
Practicality vs. Impracticality — functionality intersecting with expressive form.
Individuality vs. Conformity — desire for uniqueness framed within cultural norms.
Core Contradiction (BUC):
Comfort vs. Discomfort — the attire balances ease and protection, readiness for unpredictability while maintaining composure.

Bright and Hidden:
Bright — the bucket hat and silhouette — symbols of visible creativity and self-statement.
Hidden — the gloves and restrained tones — indicators of pragmatism and discipline beneath expression.

Approximation:
Explicit Style — casual, refined functionality; the harmony of comfort and style.
Shadow Style — quiet readiness, embracing challenge and control through subtle restraint.

Completion:
The persona’s coherence lies in their balance between practical function and aesthetic statement, harmonizing readiness with relaxed self-assurance.

Empathy:
Wearing this ensemble evokes a mindset of confidence under preparedness — calm in appearance yet alert beneath the surface.

Avoiding Stereotypes:
The interpretation reflects genuine attributes, avoiding simplification or overextension of meaning.

Limitations:
Assessment is derived strictly from visible elements — external context is intentionally excluded.
 

B. ALIGNMENT WITH BUSINESS GOALS AND STARTUP CULTURE

Alignment:
Practicality — aligns with startup dynamics valuing efficiency, adaptability, and resourcefulness.
Individuality — resonates with the entrepreneurial drive toward distinctiveness and innovation.
Comfort — reflects the creation of psychologically safe, adaptive environments conducive to ideation and productivity.

Contradictions:
Impracticality — unconventional approaches might strain operational efficiency if unchecked.
Conformity — excessive adaptation could limit disruption potential and brand differentiation.
Discomfort — readiness for discomfort strengthens resilience but requires conscious balance to prevent fatigue or overextension.

Synthesis:
This personality type naturally aligns with early-stage innovation environments — adaptive, practical, yet stylistically distinct. Their optimal performance occurs in cultures that reward initiative and tolerate controlled experimentation.


C. CONCLUSION

Explicit Essence:
Casual yet stylish — comfort balanced by readiness; practical intelligence wrapped in aesthetic confidence.
`,
  },

  {
    id: '29',
    src: '/gallery/gallery29.jpg',
    title: 'Bright & Barefoot',
    description: `

A. OBSERVATION

The individual, a woman, is wearing a striped shirt paired with a bright yellow jacket and light blue jeans, walking barefoot on the beach. The image communicates lightness, comfort, and a sense of freedom, blending casual simplicity with a lively, expressive touch.

Explicit Qualities:
Casualness — relaxed, informal approach to life.
Comfort — ease and practicality, prioritizing physical and emotional comfort.
Brightness — the yellow jacket signifies optimism, vibrancy, and visibility.
Simplicity — striped shirt reflects straightforwardness and minimal complication.
Freedom — walking barefoot on the beach embodies liberation and natural connection.

Shadow Qualities:
Complexity — hidden depth beneath the visible simplicity.
Seriousness — a potential for introspection and thoughtfulness.
Restriction — a latent need for control or structured boundaries within freedom.

Contradictions and Core Inner Conflict:
Primary Contradictions:
Brightness vs. Simplicity — external vividness balanced by understated clarity.
Freedom vs. Restriction — openness coexisting with a subtle need for grounding and order.

Balance of Underlying Contradictions (BUC):
Freedom vs. Restriction — the central psychological axis; balancing a desire for spontaneity with the comfort of light structure.

Bright and Hidden:
Bright — the yellow jacket, symbol of joy and confident energy.
Hidden — the implicit restraint within her controlled casualness, hinting at an inner balance between wildness and composure.

Approximation:
Explicit Essence — casual, bright, simple, and free.
Shadow Essence — complex, serious, and subtly restricted.

Completion:
The persona’s coherence is achieved when the visible brightness harmonizes with the inner depth and quiet need for self-anchoring.
 


B. SALES PITCH TAILORING

Tone and Approach:
Approach with warmth, informality, and ease — a conversational style that mirrors her natural and relaxed energy.
Frame communication around emotional liberation and uncomplicated value, avoiding overly corporate or rigid tones.

Language and Style:
Preferred Words — relaxed, comfortable, vibrant, simple, free, natural, effortless.
Key Style — informal, human, and relatable with vivid imagery and sensory appeal.
Positioning — emphasize lightness and freedom without undermining control or structure.

Motivators:
Freedom — demonstrate how the product or service enhances independence and natural flow in daily life.
Comfort — underline simplicity and ease of experience as emotional anchors.
Control — subtly show how the offering provides a framework without limiting autonomy.

Proof Strategy:
Use authentic storytelling, testimonials, or visual proof (images or short videos) portraying real people engaging with the product in simple, natural, and joyful contexts.
Highlight user experiences that reflect comfort, freedom, and authenticity rather than technical specifications or formal achievements.


C. CONCLUSION

Explicit Essence:
Casual, bright, simple, and free — an individual whose brightness and freedom coexist with quiet discipline and understated control.
`,
  },

  {
    id: '30',
    src: '/gallery/gallery30.jpg',
    title: 'Bold & Subtle',
    description: `

A. OBSERVATION

Clothing — the individual is wearing a long red coat, a teal hoodie, a white t-shirt, blue jeans, and white sneakers.
Accessories — no visible accessories other than the clothing.

Explicit Qualities:
Red Coat — boldness, confidence, attention to style.
Teal Hoodie — comfort, casualness, and a touch of creativity.
White T-shirt — simplicity and clarity.
Blue Jeans — practicality and everyday usability.
White Sneakers — youthfulness and casual energy.

Shadow Qualities:
Boldness — may conceal subtlety or a desire for anonymity.
Comfort — might mask the willingness to face discomfort.
Simplicity — could hide inner complexity.
Practicality — might imply moments of spontaneity or unpredictability.
Youthfulness — can coexist with maturity and seriousness.

Contradictions and Core Inner Conflict:
Boldness vs. Subtlety — the red coat signals a wish to stand out, while the casual layers suggest comfort with blending in.
Comfort vs. Discomfort — comfort is prioritized, yet balanced with a willingness to endure slight discomfort for the sake of expression.
Simplicity vs. Complexity — minimal base layers contrast with layered, expressive choices.
Practicality vs. Impracticality — jeans ground the look, while the coat introduces aesthetic over function.
Youthfulness vs. Maturity — casual shoes meet thoughtful coordination, indicating maturity of taste.

Balance of Underlying Contradictions (BUC):
Boldness vs. Subtlety — the individual maintains tension between visibility and discretion.

Approximation:
Explicit Style — fashion-forward yet casual; blending bold statements with practical ease.
Shadow Style — subtle complexity beneath confident presentation.
Completion — the analysis concludes when both expressive and restrained elements are integrated coherently.
 


B. UNCONSCIOUS DECISION-MAKING STYLE AND BIASES / RISKS

Unconscious Decision-Making Style:
Balanced Decision-Maker — decisions are shaped by weighing bold, confident impulses with subtle, thoughtful restraint. Reflects awareness of both visibility and discretion, comfort and challenge.

Biases and Risks:
Confirmation Bias — may seek validation for bold choices, overlooking subtler alternatives.
Overconfidence — confidence in expression may translate to excessive certainty in decisions.
Comfort Zone Bias — prioritizing comfort might restrict engagement with riskier or growth-oriented opportunities.
Complexity Avoidance — simplicity in choices could lead to missing nuanced or multifaceted possibilities.


C. CONCLUSION

Balance of Underlying Contradictions:
Boldness vs. Subtlety — the individual balances the desire to be noticed with the comfort of remaining understated.
`,
  },

  {
    id: '31',
    src: '/gallery/gallery31.jpg',
    title: 'Appearance-Based Psychographics Marketing Research',
    description: `
  
This study is based on observational data of clothing-store visitors (Massimo Dutti). It is research-oriented, contains no personal data, and does not claim absolute truth. It is a consultative opinion by specialists in Human Risk Analytics and Urban Behaviour Artists.

Introduction

The data below are intrinsically valuable because they are observed, operationalisable markers (clothing, accessories) that do not depend on self-report. Across the items, the same psychometric axes recur, enabling a typology without questionnaires directly “on the shop floor”.

Direct applications (without surveys):

A tag ontology for visitor tagging and rapid in-store segmentation.
A creativity/copy matrix by poles (e.g., “comfort/practicality” vs “drama/uniqueness”).
Micro-merchandising/planograms or window displays aligned with prevailing traffic poles.
Sales scripts by poles.
Minimum to activate: unified tag glossary → observation/annotation guideline → simple decision map “tag → display/creative/script”.

Observational Data

The group is wearing mainly dark clothing items, combined with casual and comfortable pieces. Most individuals wear coats, jackets, or hoodies, paired with trousers or jeans, and casual shoes such as sneakers, boots, or loafers and accessories like bags, shopping bags, umbrellas.
Based on the observation, a working assumption about average qualities was made and these data are used further to refine towards a concrete marketing proposition.

Main psychological qualities:

Comfort, practicality, freedom, simplicity, sophistication, elegance, modernity, preparedness, style, neutrality, groundedness, detail, warmth, brand awareness, cohesion, drama.

Main shadow qualities (leading):

Desire for challenge, need for structure, hidden uniqueness, fear of chaos, discomfort beneath comfort, suppressed spontaneity, wish for formality, unpreparedness, rebellion, depth, playfulness, indulgence, impracticality, conformity, sensitivity, nurturing, control, independence, reliability, escapism.

From this, the narrowed spectrum of relevant qualities for focus is:

Comfortable, casual, practical, challenging, structured, elegant, sophisticated, dramatic, stylish, simple, spontaneous, classic, modern, unique.



Metaphors describing the group and their balance (explicit ↔ shadow):

Relaxed tech-savvy ↔ structured innovator; 
Balance of comfort and practicality ↔ desire for change; 
Comfort ↔ challenge; 
Sophisticated and modern ↔ personal comfort; 
Sophisticated exterior ↔ dramatic expression; 
Practical and stylish ↔ occasional spontaneity; 
Harmony and control ↔ independence and reliability; 

Conclusion: Balanced freedom and structure.

Hidden command (how they wish to be seen/treated):

“I am comfortable and in control, but challenge me to grow.”
“I am comfortable and practical, but allow me to explore beyond my comfort zone.”
“I am elegant and practical, but allow me to be spontaneous and simple.”
“I am sophisticated yet approachable. Respect my professionalism but acknowledge my personal style.”
“I value sophistication but also drama; respect both.”
“I am practical and stylish, but allow me spontaneity.”
“Maintain control while nurturing goals.”
“Focus on independence with reliability.”
“Allow me to be free, but provide structure when needed.”

Intrinsic motivation (balancing inner drives):

Comfort ↔ growth; 
Control ↔ spontaneity; 
Comfort ↔ new experience; 
Practicality; comfort ↔ challenge; 
Authenticity between professionalism and identity; 
Sophistication ↔ individuality; 
Routine ↔ spontaneity; 
Harmony of control and nurture; autonomy ↔ responsibility;
Freedom ↔ structure.

Creativity/innovation potential (average): 5.6/10.



Marketing-Ready: Segmented & Summarised Data

What the group wears:

Dark clothing elements (shoes/trousers): 89%
Outerwear present (jacket/coat/overcoat/hoodie/cardigan): 100%
Items carried (observed): shopping bags, umbrella, bag, flowers, keys, etc.

What the group gravitates to

Comfort: 67%
Practicality: 56%
Style/Elegance present: 44%

Dualities and readiness for polar decisions

Comfort as leading via contradiction: 44%
Practicality with hidden opposite (spontaneity/indulgence/whimsy): 44%
Hidden drive toward uniqueness: 33%
Control/structure as inner theme: 33%
Formal vs informal duality: 33%
Comfort opposed to Challenge/Discomfort: 44%
Practicality opposed to Spontaneity/Impracticality: 33%
Structure/Control vs Freedom/Spontaneity (recurring): 44%

Expressed style carriers

Explicit comfort/casual/practical line: 33%
“Casual” explicitly present: 44%
Elegant/Sophisticated/Classic/Modern/Drama (explicit): 44%



Strategy starting point (from observed data)

Comfort/Practical/“Practical & stylish”: 44% ↔ Challenge/Explore/Spontaneity/Freedom: 56%

Unconscious decision-making (aggregated)

Intuitive as baseline style: 78%
Confirmation bias: 44%
Status quo bias / avoidance of change: 33%
Risk aversion: 33%
Compromise/Routine/Avoid risk: 33%

Drivers (aggregated)

Frequent “comfort/practical/practicality”: 67%
Balance / opposites noted: 44%
Control/Structure/Order: 44%
Growth/Freedom/Development (inner vector): 22%

Conclusion
On the basis of this study and the brand’s positioning (Massimo Dutti https://www.massimodutti.com/ie/ ), we have grounds to trust appearance-based psychographics as an input to marketing analysis, provided observations or photographs that respect local regulations at the place of study. With iterative collaboration and method improvement, such observations can be used not only as a supporting factor but, where appropriate, as a leading factor, because the decisions described are independent of self-report.`,
  },

  {
    id: '32',
    src: '/gallery/gallery32.jpg',
    title: 'Freedom & Control',
    description: `

A. OBSERVATION

The person is driving a convertible car, wearing a light-colored checkered shirt and light blue jeans. The open-top car conveys movement, openness, and autonomy — a balance between freedom and direction.

Explicit Qualities:
Freedom — the open convertible symbolizes independence and the pursuit of unrestricted experiences.
Comfort — casual, breathable attire suggests ease and relaxation.
Practicality — light, functional clothing reflects mindfulness and adaptability.

Shadow Qualities:
Control — driving the vehicle indicates a desire to maintain command and direction.
Formality — a subtle inclination toward order and structured presentation beneath casual appearance.
Impulsiveness — the readiness for spontaneity contrasts with otherwise practical tendencies.

Contradictions and Core Inner Conflict:
Freedom vs. Control — the primary dynamic tension; seeking openness while preserving mastery over circumstances.
Comfort vs. Formality — relaxed presentation balancing internal discipline.
Practicality vs. Impulsiveness — responsibility coexisting with an appetite for adventure.

Balance of Underlying Contradictions (BUC):
Freedom vs. Control — the defining axis; this person integrates unrestrained movement with deliberate guidance.

Bright and Hidden:
Bright — visible freedom, spontaneity, and relaxed composure.
Hidden — subtle control instincts that preserve direction and predictability.

Approximation:
Explicit Essence — relaxed freedom, natural ease, spontaneous authenticity.
Shadow Essence — structured control, inner need for order and predictability.

Synthesized Role:
The Relaxed yet Controlled Driver — a personality that merges autonomy with subtle discipline.

Hidden Command:
"I want to be free, but allow me to maintain control."
 


B. FEEDBACK CALIBRATION

Tone and Interaction:
Adopt a friendly, respectful tone that recognizes their autonomy and acknowledges their balance between freedom and control.
Offer insights as collaborative observations rather than instructions.

Best Language and Keywords:
Freedom, Balance, Control, Respect, Understanding, Appreciation.

Recommended Opening Line:
"I appreciate how you manage to balance freedom with control in your approach."

Avoided Phrases:
Avoid direct or restrictive statements such as "You need to control yourself" or "You're too free-spirited."  
Avoid tones that imply limitation or constraint — maintain language of mutual respect and equilibrium.

Follow-Up Engagement:
Prompt reflection by asking:  
"How do you feel about this balance, and what could enhance it for you?"  
Encourage ownership of insight rather than prescribing solutions.


C. CONCLUSION

Core Statement:
"I want to be free, but allow me to maintain control."
`,
  },

  {
    id: '33',
    src: '/gallery/gallery33.jpg',
    title: 'Elegant Ease',
    description: `

A. OBSERVATION

The person is dressed in a black, ribbed, high-neck top — a garment that conveys refinement, restraint, and quiet confidence. The hair is long, well-maintained, and neatly styled, revealing care for presentation and attention to visual harmony.

Explicit Qualities:
Sophistication — the choice of high-neck, textured material communicates taste and refinement.
Elegance — overall appearance is polished, minimalistic, and composed.
Attention to Detail — evident in grooming, proportional balance, and restraint in accessories.
Discipline — consistency in maintaining a clean, structured image.
Calmness — conveyed through color choice and still posture.

Shadow Qualities:
Casualness — a potential preference for comfort hidden behind the polished look.
Nonchalance — emotional lightness or detachment beneath elegance.
Practicality — minimalism may stem from a pragmatic rather than purely aesthetic mindset.
Need for Simplicity — an avoidance of excess or overexposure.
Hidden Individualism — quiet expression through form and restraint.

Contradictions and Core Inner Conflict:
Primary Contradiction:
Sophistication vs. Casualness — the tension between formal refinement and an inner desire for relaxed authenticity.
Supporting Contradictions:
Elegance vs. Nonchalance — balance between intentional style and natural ease.
Control vs. Comfort — composed appearance masking the search for genuine simplicity.

Balance of Underlying Contradictions (BUC):
Sophistication vs. Casualness — the central balance defining the persona: polished discipline harmonized with quiet comfort.

Bright and Hidden:
Bright — elegance, refinement, attentiveness to visual and social presentation.
Hidden — simplicity, warmth, and understated practicality.

Approximation:
Personal Style — Elegant Simplicity; the intersection of structured sophistication and effortless comfort.
Synthesized Role — Refined Minimalist; one who values both composure and ease.

Hidden Command:
"See my elegance, but recognize my ease beneath it."
 


B. JOB SUITABILITY

Best Fit Roles:
Fashion Stylist — alignment with refined aesthetics, attention to texture, and disciplined yet creative sensibility.
Event Planner — balance of sophistication and practicality supports structured creativity under pressure.
Public Relations Specialist — effective blend of polish and approachability in both visual and interpersonal domains.
Creative Director — suitable for leadership requiring refined taste, vision, and minimalist precision.

Unsuitable Roles:
Manual Labour — environment misaligned with aesthetic focus and balance-seeking nature.
Data Entry Clerk — repetition and lack of expressive dimension conflict with need for creative and relational engagement.
Factory Worker — low aesthetic engagement and absence of refinement limit motivational alignment.

Contextual Note:
This individual thrives where refinement meets freedom — environments that allow structured creativity, balanced with authenticity and calm communication.


C. CONCLUSION

Core Statement:
Personal Style: Elegant Simplicity — combining sophistication with a touch of casualness.
`,
  },
  {
    id: '34',
    src: '/gallery/gallery34.jpg',
    title: 'Adaptable Pro',
    description: `

A. OBSERVATION

Clothing Style:
The individual is dressed in a dark coat, dark pants, and casual sneakers. The contrast between formal outerwear and relaxed footwear communicates versatility — professionalism tempered by comfort and adaptability.

Explicit Qualities:
Practicality — preference for functional choices over excessive formality.
Comfort — prioritization of ease and mobility.
Professionalism — outward projection of discipline and reliability.
Seriousness — alignment with purpose and responsibility.
Minimalism — focus on essentials, elimination of excess.
Functionality — efficiency and clarity of intent.
Confidence — visible ease and grounded self-assurance.
Tradition — respect for established norms and stable environments.

Shadow Qualities:
Desire for Freedom — under the structured exterior lies an openness to self-expression.
Non-Conformity — quiet independence from rigid expectations.
Playfulness — subtle inclination toward spontaneity beneath composure.
Extravagance — potential for expressive detail under restraint.
Need for Control — emotional regulation through order.
Innovation — adaptability within boundaries, readiness to evolve.

Contradictions and Core Inner Conflict:
Primary Contradiction:
Professionalism vs. Casualness — balance between formal discipline and relaxed self-expression.
Supporting Contradictions:
Tradition vs. Innovation — valuing stability while being open to transformation.
Seriousness vs. Playfulness — composed demeanor concealing creative impulses.

Balance of Underlying Contradictions (BUC):
Professionalism vs. Casualness — the defining axis on which personality equilibrium rests. A controlled adaptability allowing integration into both structured and flexible contexts.

Bright and Hidden:
Bright — the visible professionalism, order, and control.
Hidden — the need for freedom and comfort expressed through casual details.

Approximation:
Personal Style — Adaptable Professionalism; formal in principle, relaxed in execution.
Synthesized Role — Practical Leader, capable of transitioning between traditional authority and modern informality.

Hidden Command:
"I am serious and professional, but allow me the freedom to be comfortable and relaxed."
 


B. EXECUTIVE INTERACTION TENDENCIES AND ROLE FIT

Executive Interaction Tendencies:
Interacts with composure and approachability; blends strategic discipline with human understanding.
Values practical, result-oriented discussions balanced with openness to modern perspectives.
Excels in structured environments that still allow autonomy and adaptive decision-making.

C-Level Role Fit:
Best suited for leadership in transitional organizations — mid-size companies evolving toward modern frameworks or innovation-driven growth.
Strength lies in balancing stability with transformation, ensuring continuity while fostering creative adaptation.
Ideal in CEO or COO roles where equilibrium between process, people, and progress defines success.

Hiring Risks to Investigate:
Unknown from Photo — extent of executive experience in similarly scaled organizations.
Unknown from Photo — behavioral pattern under high stress or during conflict mediation.
Unknown from Photo — depth of risk tolerance and long-term strategic decision capacity.

Development Note:
Leadership potential is strong when balance between professionalism and comfort is consciously maintained. Overemphasis on one side may reduce authenticity or presence.


C. CONCLUSION

Core Statement:
"I am serious and professional, but allow me the freedom to be comfortable and relaxed."
`,
  },
  {
    id: '35',
    src: '/gallery/gallery35.jpg',
    title: 'Calm & Intense',
    description: `

A. OBSERVATION

The person is dressed in neutral tones — a light beige coat, a soft sweater, and dark trousers. Their expression is composed, the gaze direct yet serene. The background is blurred, emphasizing inner presence rather than context.

Explicit Qualities:
Calmness — emotional stability, clarity, and control.
Elegance — understated sophistication through simplicity.
Focus — directness of gaze and deliberate posture.
Confidence — quiet strength without overstatement.
Comfort — tactile softness in textures and fabrics.

Shadow Qualities:
Intensity — passion and depth concealed under calm exterior.
Vulnerability — sensitivity masked by composure.
Rigidity — the potential to hold emotions too tightly.
Isolation — tendency to internalize rather than externalize.
Unpredictability — emotional surges beneath serene appearance.

Contradictions and Core Inner Conflict:
Primary Contradiction:
Calmness vs. Intensity — equilibrium between inner fire and external stillness.
Supporting Contradictions:
Confidence vs. Vulnerability — poised assurance masking emotional depth.
Comfort vs. Rigidity — pursuit of ease challenged by self-control.

Balance of Underlying Contradictions (BUC):
Calmness vs. Intensity — the essential axis; mastery of emotional containment while sustaining internal drive.

Bright and Hidden:
Bright — composure, serenity, emotional clarity.
Hidden — intensity, passion, and inner restlessness.

Approximation:
Personal Style — Controlled Serenity, blending warmth and focus with precision.
Synthesized Role — Centered Strategist: grounded, analytical, yet capable of emotional depth and creative tension.

Hidden Command:
"See my calm, but do not underestimate my fire."
 

B. INTERACTION AND COLLABORATION STRATEGY

Tone and Engagement:
Engage with a calm, steady tone that mirrors their composed energy. Avoid overstimulation or exaggerated enthusiasm. Respect boundaries while acknowledging their depth.

Language and Framing:
Preferred Words — balance, clarity, focus, grounded, depth, respect, intensity, flow.
Interaction Focus — acknowledge their quiet strength and capacity for introspection. Avoid superficial or chaotic exchanges.

Motivators:
Autonomy — provide space to process independently.
Recognition — affirm their balance between emotion and control.
Depth — engage in meaningful, non-performative discussions.

Risks:
If overstimulated or pressured, this person might withdraw or become overly self-contained.
If unchallenged, they might suppress their inner drive, losing emotional engagement.

Collaboration Advice:
Approach with respect for their rhythm. Use calm clarity, not dominance.
Frame challenges as opportunities for deeper focus rather than confrontation.


C. CONCLUSION

Core Statement:
"See my calm, but do not underestimate my fire."
`,
  },
];

// ---------- утилиты ----------
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Предзагрузка с ограничением конкуренции и ретраями — БЕЗ возврата промиса из useEffect */
function useImagesPreload(urls: string[], opts: { concurrency?: number; retries?: number } = {}) {
  const { concurrency = 6, retries = 2 } = opts;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;

    const loadOne = (src: string, attempt = 0): Promise<void> =>
      new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.crossOrigin = 'anonymous';
        img.referrerPolicy = 'no-referrer';
        img.onload = () => resolve();
        img.onerror = () => {
          if (attempt < retries) {
            const backoff = 200 * (attempt + 1);
            setTimeout(() => {
              if (!alive) return resolve();
              loadOne(src, attempt + 1).then(resolve);
            }, backoff);
          } else {
            resolve(); // не блокируем весь процесс из-за одного файла
          }
        };
        img.src = src;
      });

    const queue = [...urls];
    let done = 0;

    async function runNext() {
      if (!alive) return;
      const src = queue.shift();
      if (!src) return;
      await loadOne(src);
      if (!alive) return;
      done++;
      if (done === urls.length) {
        setReady(true);
      } else if (queue.length) {
        // запускаем следующий
        runNext();
      }
    }

    // стартуем заданное число «воркеров»
    const starters = Math.min(concurrency, queue.length);
    for (let i = 0; i < starters; i++) runNext();

    // ВОЗВРАЩАЕМ ТОЛЬКО CLEANUP
    return () => {
      alive = false;
    };
  }, [urls, concurrency, retries]);

  return ready;
}

// ---------- аспекты карточек ----------
type Aspect = '1/1' | '4/3' | '3/4' | '16/9';
const ASPECTS_POOL: Aspect[] = ['4/3', '4/3', '16/9', '1/1', '3/4'];

const ASPECT_CLASS: Record<Aspect, string> = {
  '1/1': 'aspect-[1/1]',
  '4/3': 'aspect-[4/3]',
  '3/4': 'aspect-[3/4]',
  '16/9': 'aspect-[16/9]',
};

function randomAspect(): Aspect {
  const u8 = new Uint8Array(1);
  crypto.getRandomValues(u8);
  return ASPECTS_POOL[u8[0] % ASPECTS_POOL.length];
}

// =============================
// СТРАНИЦА
// =============================
export default function Page() {
  // Пул >=50
  const duplicated: ImageItem[] = useMemo(() => {
    const need = 50;
    const out: ImageItem[] = [];
    let c = 0;
    while (out.length < need) {
      for (const base of BASE_IMAGES) {
        if (out.length >= need) break;
        c += 1;
        out.push({ ...base, id: `${base.id}-${c}` });
      }
    }
    return out;
  }, []);

  const images = useMemo(() => shuffle(duplicated).slice(0, 50), [duplicated]);
  const aspects = useMemo(() => images.map(() => randomAspect()), [images]);
  const ready = useImagesPreload(
    images.map((i) => i.src),
    { concurrency: 6, retries: 2 }
  );

  const [elevatedId, setElevatedId] = useState<string | null>(null);
  const [sidebarId, setSidebarId] = useState<string | null>(null);

  const tapLockRef = useRef(false);
  const suppressTapRef = useRef(false);

  const openSidebar = useCallback((id: string) => {
    if (tapLockRef.current) return;
    setSidebarId(id);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarId(null);
    tapLockRef.current = true;
    setTimeout(() => {
      tapLockRef.current = false;
    }, 250);
  }, []);

  const closeSidebarSafe = useCallback(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    if (isMobile) {
      suppressTapRef.current = true;
      setTimeout(() => {
        suppressTapRef.current = false;
      }, 550); // окно больше, чтобы синтетический click не пробился
    }
    closeSidebar();
  }, [closeSidebar]);

  // Esc → закрыть
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSidebar();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeSidebar]);

  const onCardClick = (id: string) => {
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

    if (isDesktop) {
      // Десктоп НЕ трогаем
      openSidebar(id);
      setElevatedId(null);
      return;
    }

    // если сайдбар ОТКРЫТ — закрываем и выходим (ничего не открываем этим же тапом)
    if (sidebarId) {
      closeSidebarSafe();
      return;
    }

    // если только что закрывали — глушим «пролетевший» клик
    if (suppressTapRef.current) {
      return;
    }

    // сайдбар закрыт — открываем карточку
    openSidebar(id);
    setElevatedId(null);
  };

  // Клавиатура
  const onCardKey = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

      if (isDesktop) {
        // Desktop: открыть сразу
        openSidebar(id);
        setElevatedId(null);
        return;
      }
      // Mobile: оставить текущую логику через onCardClick
      onCardClick(id);
    }

    if (e.key.toLowerCase() === 'i') {
      e.preventDefault();
      openSidebar(id);
    }
  };

  if (!ready) return <GlobalLoading />;

  // Сайдбар всегда 1/3
  const sidebarWidthClass = 'lg:w-[33.33vw]';
  const gridShiftClass = sidebarId ? 'lg:ml-[33.33vw]' : 'ml-0';

  return (
    <div className="relative">
      {/* Header: слева ↔ справа при открытом сайдбаре */}
      <header className="sticky top-0 z-30 bg-[var(--background)]/70 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/60">
        <div
          className={[
            'mx-auto max-w-[1600px] px-4 py-4 transition-all duration-300 flex',
            sidebarId ? 'justify-end' : 'justify-start',
          ].join(' ')}
        >
          <Link
            href="/"
            className="text-base font-medium tracking-[0.2em] uppercase text-white/80 hover:opacity-90 transition"
          >
            H1NTED Life Gallery
          </Link>
        </div>
      </header>

      {/* SIDEBAR */}
      <Sidebar
        item={images.find((i) => i.id === sidebarId) || null}
        onClose={closeSidebarSafe}
        widthClass={sidebarWidthClass}
      />

      {/* MASONRY (без пустот) */}
      <div className={['transition-[margin] duration-300', gridShiftClass].join(' ')}>
        <div
          className={[
            'columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5',
            'gap-x-3',
            'mx-auto max-w-[1600px] px-2 sm:px-4',
          ].join(' ')}
          aria-label="Pininfarina Gallery"
        >
          {images.map((item, idx) => (
            <div key={item.id} className="mb-3 break-inside-avoid">
              <MosaicTile
                item={item}
                elevated={elevatedId === item.id && sidebarId === null}
                onClick={() => onCardClick(item.id)}
                onOpenInfo={() => openSidebar(item.id)}
                onKey={(e) => onCardKey(e, item.id)}
                aspectClass={ASPECT_CLASS[aspects[idx]]}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================
// ПЛИТКА с устойчивой загрузкой
// =============================
function MosaicTile({
  item,
  elevated,
  onClick,
  onOpenInfo,
  onKey,
  aspectClass,
}: {
  item: ImageItem;
  elevated: boolean;
  onClick: () => void;
  onOpenInfo: () => void;
  onKey: (e: React.KeyboardEvent) => void;
  aspectClass: string;
}) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const attempts = useRef(0);

  useEffect(() => {
    setStatus('loading');
    attempts.current = 0;
    setReloadKey(0);
  }, [item.src]);

  const handleError = () => {
    if (attempts.current < 2) {
      attempts.current += 1;
      // небольшой бэкофф и принудительный ре-маунт <img>
      setTimeout(() => setReloadKey((k) => k + 1), 200 * attempts.current);
    } else {
      setStatus('error');
    }
  };

  return (
    <article
      tabIndex={0}
      aria-label={item.title}
      onClick={onClick}
      onKeyDown={onKey}
      className={[
        'group relative w-full overflow-hidden rounded-[16px]',
        'shadow-[0_8px_24px_rgba(0,0,0,.08)]',
        'ring-1 ring-inset ring-white/5',
        'transition-transform duration-200 ease-[cubic-bezier(.2,.8,.2,1)] will-change-transform',
        elevated ? 'z-10 scale-[1.02] -translate-y-[2px]' : '',
      ].join(' ')}
    >
      <div className={['relative', aspectClass].join(' ')}>
        {/* Скелетон вместо «чёрной пустоты» */}
        <div
          className={[
            'absolute inset-0',
            'bg-[radial-gradient(100%_60%_at_30%_20%,rgba(255,255,255,.06),rgba(255,255,255,.02)_45%,transparent_80%)]',
            'animate-pulse',
            status === 'ok' ? 'opacity-0' : 'opacity-100',
            'transition-opacity duration-200',
          ].join(' ')}
        />

        {status !== 'error' ? (
          <img
            key={reloadKey}
            src={item.src}
            alt={item.title}
            loading="lazy"
            decoding="async"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover select-none"
            draggable={false}
            onLoad={() => setStatus('ok')}
            onError={handleError}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70">
              No access
            </span>
          </div>
        )}

        {/* Показываем UI только когда картинка реально загрузилась */}
        {status === 'ok' && (
          <>
            {/* Hover-маска */}
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/45" />
            </div>

            {/* Info puck — Pininfarina */}
            <button
              aria-label="Подробнее"
              onClick={(e) => {
                e.stopPropagation();
                onOpenInfo();
              }}
              className={[
                'absolute left-3 top-3 z-10 grid place-items-center',
                'h-7 w-7 rounded-full',
                'bg-gradient-to-b from-white/14 to-white/6',
                'backdrop-blur-md ring-1 ring-white/20',
                'shadow-[0_2px_8px_rgba(0,0,0,.25)]',
                'text-white/90',
                'transition-all duration-150 hover:scale-[1.03] active:scale-[0.98]',
              ].join(' ')}
            >
              <InfoIcon />
            </button>

            {/* Caption */}
            <div className="absolute inset-x-0 bottom-0 px-3 pb-2">
              <p className="truncate text-[13px] font-medium text-white font-monoBrand tracking-tight">
                {item.title}
              </p>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

// =============================
// САЙДБАР (1/3 ширины, без переключателя)
// =============================
function Sidebar({
  item,
  onClose,
  widthClass,
}: {
  item: ImageItem | null;
  onClose: () => void;
  widthClass: string;
}) {
  const open = Boolean(item);
  const panelRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <div
        onPointerDown={(e) => {
          // только мобила; десктоп НЕ трогаем
          if (typeof window !== 'undefined' && window.innerWidth >= 1024) return;
          e.stopPropagation(); // не даём событию пройти в карточки
          onClose(); // закрываем сайдбар (через closeSidebarSafe)
        }}
        className={[
          'fixed inset-0 z-40 bg-black/30 lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
          'transition-opacity duration-200',
        ].join(' ')}
      />

      <aside
        ref={panelRef}
        className={[
          'fixed left-0 top-0 bottom-0 z-50 w-[85vw] max-w-[520px]',
          widthClass, // lg:w-[33.33vw]
          'bg-neutral-950 text-neutral-100 border-r border-white/10',
          'px-6 py-6',
          'overflow-y-auto overscroll-contain', // ✅ добавлено
          'scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent', // ✅ стилизованный скролл (Tailwind)
          'transition-transform duration-300 will-change-transform',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        aria-hidden={!open}
        aria-label="Read About It"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-wide">{item?.title ?? ''}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid place-items-center h-8 w-8 rounded-xl bg-white/10 hover:bg-white/15"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mt-5 rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,.2)] ring-1 ring-inset ring-white/5">
          {item && (
            <img
              src={item.src}
              alt={item.title}
              className="w-full h-48 object-cover"
              draggable={false}
              decoding="async"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
          )}
        </div>

        <pre className="mt-5 text-sm leading-relaxed text-neutral-300 whitespace-pre-wrap font-sans">
          {item?.description ?? ''}
        </pre>
      </aside>
    </>
  );
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="8" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
