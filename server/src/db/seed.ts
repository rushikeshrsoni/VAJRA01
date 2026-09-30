import bcrypt from 'bcryptjs';
import { pool, userQuery } from './index.js';
import { runMigrations } from './migrate.js';

export const seedDatabase = async () => {
  console.log('Seeding CropPilot AI with realistic demo data...');
  await runMigrations();

  const demoEmail = 'kisan@croppilot.ai';
  const demoPassword = 'FarmPilot@2025';

  // Check if demo user already exists
  const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [demoEmail]);
  let userId: string;

  if (existingUser.rows.length > 0) {
    userId = existingUser.rows[0].id;
    console.log(`Demo user already exists: ${demoEmail} (${userId})`);
  } else {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(demoPassword, salt);

    const userRes = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, phone, preferred_language, region_state)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        demoEmail,
        passwordHash,
        'Rajesh Kumar Patil',
        '+91 98230 45678',
        'en',
        'Maharashtra',
      ]
    );
    userId = userRes.rows[0].id;
    console.log(`Created demo user: ${demoEmail} (${userId})`);
  }

  // Create demo farms if none exist
  const existingFarms = await userQuery(userId, 'SELECT id FROM farms WHERE user_id = $1', [userId]);
  let farm1Id: string;
  let farm2Id: string;

  if (existingFarms.rows.length === 0) {
    const farm1Res = await userQuery(
      userId,
      `INSERT INTO farms (
        user_id, name, state, district, soil_type, soil_ph, organic_matter,
        irrigation_method, farm_size_acres, primary_crops, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id`,
      [
        userId,
        'Sahyadri Agro Orchards & Pulses',
        'Maharashtra',
        'Nashik',
        'Black Soil (Regur)',
        7.2,
        'Medium',
        'Drip Irrigation',
        6.5,
        ['Tomato', 'Soybean', 'Pigeon Pea (Tur)', 'Onion'],
        'Gentle slope with drip fertigation setup. Soil tested in May 2024.',
      ]
    );
    farm1Id = farm1Res.rows[0].id;

    const farm2Res = await userQuery(
      userId,
      `INSERT INTO farms (
        user_id, name, state, district, soil_type, soil_ph, organic_matter,
        irrigation_method, farm_size_acres, primary_crops, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id`,
      [
        userId,
        'Godavari Riverside Plot',
        'Maharashtra',
        'Nashik',
        'Alluvial Loam',
        6.8,
        'High',
        'Canal / Flood',
        3.2,
        ['Wheat', 'Gram (Chana)', 'Coriander'],
        'Lowland fertile alluvial soil near river basin with year-round water access.',
      ]
    );
    farm2Id = farm2Res.rows[0].id;
    console.log('Created 2 demo farms.');
  } else {
    farm1Id = existingFarms.rows[0].id;
    farm2Id = existingFarms.rows[1]?.id || farm1Id;
  }

  // Seed sample diagnosis if none
  const existingDiagnoses = await userQuery(userId, 'SELECT id FROM diagnoses WHERE user_id = $1', [userId]);
  if (existingDiagnoses.rows.length === 0) {
    const diagnosisResponse = {
      disease_name: 'Early Blight of Tomato (Alternaria solani)',
      scientific_name: 'Alternaria solani',
      confidence_score: 93,
      severity: 'medium',
      matched_symptoms: [
        'Dark brown concentric rings on lower leaves resembling target-board patterns',
        'Yellow chlorotic halos surrounding leaf lesions',
        'Lower leaf yellowing and premature leaf drop',
        'Dark sunken lesions on lower stems near ground level'
      ],
      possible_causes: [
        'High atmospheric humidity (above 80%) coupled with temperatures between 24-29°C',
        'Overhead irrigation splashing soil-borne fungal spores onto lower foliage',
        'Dense foliage canopy restricting internal airflow and drying'
      ],
      immediate_actions: [
        'Prune and destroy infected lower foliage immediately to prevent upward spore dispersal.',
        'Cease overhead sprinkler watering; irrigate strictly at the base via drip lines.',
        'Clean and disinfect pruning shears with 70% isopropyl alcohol between plants.'
      ],
      treatment_organic: [
        'Foliar spray of 5% Neem Seed Kernel Extract (NSKE) or cold-pressed Neem Oil @ 5ml/liter with mild detergent.',
        'Soil drenching around root zones with Trichoderma harzianum bio-formulation (10g/L).',
        'Sour buttermilk spray diluted 1:10 with water as a natural foliar protective barrier.'
      ],
      treatment_chemical: [
        'Mancozeb 75% WP @ 2.5 g/liter of water as protective spray at 10-day intervals.',
        'For progressive infection: Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/liter.',
        'Safety Caution: Always wear gloves and a respirator mask during spraying. Observe 14-day pre-harvest waiting period.'
      ],
      prevention_tips: [
        'Rotate crops with non-solanaceous species (maize, pulses, beans) for at least 2 seasons.',
        'Use plastic or organic straw mulch to create a physical barrier between soil spores and leaves.',
        'Select resistant hybrid seeds such as Arka Rakshak or Pusa Ruby.'
      ],
      when_to_seek_help: 'If new lesions develop on upper green fruit trusses within 5 days of treatment, contact your local KVK agronomist immediately.',
      disclaimer: 'This diagnosis is an AI-assisted advisory based on provided visual symptom descriptions. Confirm specific chemical brand recommendations with regional agricultural extension officers.'
    };

    await userQuery(
      userId,
      `INSERT INTO diagnoses (
        user_id, farm_id, crop_name, symptoms_text, request_payload,
        ai_response, confidence_score, language
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        farm1Id,
        'Tomato',
        'Brown circular rings on lower leaves with yellow margins, spreading upwards following humid rainy days.',
        JSON.stringify({
          cropName: 'Tomato',
          growthStage: 'Flowering & Early Fruiting',
          symptomsText: 'Brown circular rings on lower leaves with yellow margins',
          language: 'en',
        }),
        JSON.stringify(diagnosisResponse),
        93,
        'en',
      ]
    );
    console.log('Created sample diagnosis record.');
  }

  // Seed sample advice report if none
  const existingAdvice = await userQuery(userId, 'SELECT id FROM advice_reports WHERE user_id = $1', [userId]);
  if (existingAdvice.rows.length === 0) {
    const adviceResponse = {
      crop_recommendations: [
        {
          crop_name: 'Soybean (JS 20-34)',
          variety_suggestions: ['JS 20-34', 'JS 20-98', 'Phule Agrani'],
          suitability_reason: 'Highly compatible with Nashik black soil; builds soil nitrogen balance and resists stem fly.',
          expected_duration: '90 - 100 days'
        },
        {
          crop_name: 'Pigeonpea / Red Gram (Tur - BDN 711)',
          variety_suggestions: ['BDN 711', 'BSMR 736', 'Asha (ICPL 87119)'],
          suitability_reason: 'Deep taproot structure breaks up heavy clay subsoils while providing drought resilience.',
          expected_duration: '160 - 175 days'
        }
      ],
      soil_health_assessment: {
        current_status: 'Black soil with good cation exchange capacity. pH 7.2 is optimal, but soil aeration needs care.',
        organic_matter_advice: 'Apply 4 tonnes of composted farmyard manure (FYM) fortified with bio-fertilizers per acre prior to sowing.',
        ph_correction: 'pH is balanced in neutral range; avoid excessive chemical acidifiers.',
        deficiencies_to_watch: ['Zinc (Zn)', 'Sulphur (S)', 'Phosphorus availability']
      },
      fertilizer_schedule: [
        {
          stage: 'Basal Placement (Sowing time)',
          nutrients: 'NPK 10:26:26 @ 50 kg/acre + Zinc Sulphate @ 10 kg/acre',
          organic_alternative: 'Well-cured compost (2.5 tonnes) + Neem Cake (100 kg) + PROM (100 kg)',
          application_method: 'Drilled 5 cm to the side and below the seed furrow.'
        },
        {
          stage: 'Tillering & Vegetative Peak (30 DAS)',
          nutrients: 'Urea @ 25 kg/acre',
          organic_alternative: 'Jeevamrutha @ 200 L/acre applied with drip irrigation',
          application_method: 'Fertigated through drip lines or top-dressed ahead of light irrigation.'
        }
      ],
      irrigation_plan: {
        method: 'Drip Irrigation with 16mm inline drippers (2.4 LPH, 40cm spacing)',
        frequency: 'Every 3 to 4 days during vegetative growth; avoid water stress during flowering and pod fill.',
        water_conservation_tips: [
          'Lay 25-micron silver-black plastic mulch to reduce evaporation by 45%.',
          'Operate drip lines in late evening to eliminate mid-day solar heating of pipe water.'
        ]
      },
      pest_and_disease_risk: {
        key_threats: ['Stem Fly', 'Tobacco Caterpillar', 'Yellow Mosaic Virus'],
        preventive_measures: [
          'Pre-sowing seed treatment with Trichoderma viride and Imidacloprid.',
          'Install 6 yellow sticky traps and 4 pheromone traps per acre.'
        ]
      },
      climate_resilience_tips: [
        'Practice Broad Bed Furrow (BBF) cultivation to ensure rapid drainage during monsoon cloudbursts.',
        'Foliar spray of 1% potassium nitrate (13:0:45) in the event of an extended 10+ day dry spell.'
      ],
      actionable_summary: 'Optimized crop rotation and balanced drip fertigation will decrease input costs by ~22% and boost yield potential.',
      disclaimer: 'Advisory is generated using agricultural models. Correlate with current Indian Meteorological Department (IMD) district forecasts.'
    };

    await userQuery(
      userId,
      `INSERT INTO advice_reports (
        user_id, farm_id, request_payload, ai_response, language
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        userId,
        farm1Id,
        JSON.stringify({
          farmName: 'Sahyadri Agro Orchards & Pulses',
          goal: 'maximize_yield',
          season: 'Kharif (Monsoon)',
          currentCrops: 'Tomato & Soybean',
        }),
        JSON.stringify(adviceResponse),
        'en',
      ]
    );
    console.log('Created sample advice report.');
  }

  // Seed sample chat session if none
  const existingChats = await userQuery(userId, 'SELECT id FROM chat_sessions WHERE user_id = $1', [userId]);
  if (existingChats.rows.length === 0) {
    const sessionRes = await userQuery(
      userId,
      `INSERT INTO chat_sessions (user_id, title, language)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [userId, 'Tomato Blossom End Rot & Organic Fertilizers', 'en']
    );
    const sessionId = sessionRes.rows[0].id;

    await userQuery(
      userId,
      `INSERT INTO chat_messages (session_id, role, content)
       VALUES
       ($1, 'user', 'What causes the bottom of my tomatoes to turn black and leathery, and how do I fix it without harmful chemicals?'),
       ($1, 'assistant', 'Hello Rajesh! What you are describing is classic **Blossom End Rot (BER)** on tomatoes.\n\n### Primary Cause\nBlossom End Rot is a physiological disorder caused by **calcium deficiency in developing fruit tissue**. Interestingly, it is rarely due to a lack of calcium in the soil itself—rather, it is caused by **inconsistent watering** that prevents plant roots from absorbing and transporting calcium smoothly.\n\n### Immediate Steps to Take:\n1. **Stabilize Moisture**: Ensure your drip irrigation runs on a consistent schedule. Soil should feel evenly moist like a wrung-out sponge, never alternating between parched dry and waterlogged.\n2. **Organic Calcium Foliar Spray**: Dissolve 5 grams of **chelated calcium** or calcium nitrate per liter of water and spray the foliage and young fruit trusses in the early morning.\n3. **Quick Organic Lime/Eggshell Brew**: Steep powdered crushed eggshells or agricultural lime in sour curd/buttermilk for 5 days, dilute 1:20 with water, and drench the root zone.\n4. **Apply Mulch**: Spread a 3-inch layer of dry straw or sugarcane trash around the base of each tomato plant to preserve root-zone moisture.\n\nAre you currently noticing this on your first cluster of tomatoes, and what is your current watering schedule?'),
       ($1, 'user', 'Yes, it is on the first cluster. I was watering only every 5 days because of canal rotation.'),
       ($1, 'assistant', 'That explains it! When tomato plants go 5 days between heavy flood waterings, the roots experience water stress between days 3 and 5. When the flood finally arrives, the rapid rush of water fails to carry calcium evenly to the rapidly dividing cells at the blossom tip of the tomato.\n\n### Recommended Adjustment for Canal Irrigation:\n• **Mulch Immediately**: Heavy mulching (rice straw or sugarcane bagasse) will trap moisture in your black soil, keeping the root zone damp throughout the 5-day gap.\n• **Foliar Feed Weekly**: Because root uptake is fluctuating with the canal schedule, foliar sprays of liquid calcium bypass the roots and deliver calcium directly to the developing fruit.')`,
      [sessionId]
    );
    console.log('Created sample chat session and message thread.');
  }

  console.log('Database seeding finished successfully!');
};

// If run directly
if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}
