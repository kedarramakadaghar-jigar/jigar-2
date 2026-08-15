"""Seed course content, live sessions, testimonials, demo accounts."""
import uuid
from datetime import datetime, timezone, timedelta

COURSE_ID = "course_main"

MODULES = [
    ("Stock Market Fundamentals", "Understand what the stock market is, how it works, and why companies list."),
    ("Understanding Stocks, Exchanges & Indices", "Learn about shares, exchanges like NSE/BSE, and how indices such as Nifty & Sensex work."),
    ("Demat & Trading Account Basics", "How to open and use a Demat and trading account to buy and sell securities."),
    ("Candlestick Patterns", "Read price action using single and multi-candle patterns."),
    ("Support & Resistance", "Identify key price zones where markets tend to reverse or pause."),
    ("Trendlines & Market Structure", "Map trends, higher-highs, lower-lows and the structure of a move."),
    ("Technical Indicators", "An overview of the most useful indicators and how to combine them."),
    ("Moving Averages", "Use SMA and EMA to smooth price and spot trend direction."),
    ("RSI & MACD", "Momentum and trend-following oscillators for timing entries."),
    ("Chart Patterns", "Recognise triangles, flags, head & shoulders and more."),
    ("Technical Analysis", "Bring indicators, patterns and structure together into a framework."),
    ("Trading Strategies", "Build rule-based strategies for different market conditions."),
    ("Options Trading Basics", "Understand calls, puts, premiums and basic option strategies."),
    ("Risk Management", "Protect your capital with stop-losses and disciplined risk rules."),
    ("Trading Psychology", "Master the mindset, emotions and discipline of trading."),
    ("Position Sizing & Capital Management", "Size positions correctly and manage your overall capital."),
    ("Practical Chart Analysis", "Apply everything to real charts, step by step."),
    ("Advanced Trading Concepts", "Explore advanced ideas to continue growing as a trader."),
]

VIDEOS = [
    "https://www.youtube.com/embed/p7HKvqRI_Bo",
    "https://www.youtube.com/embed/Xn7KWR9EOGQ",
    "https://www.youtube.com/embed/ZCFkWDdmXG8",
]

OBJECTIVES = [
    ["Understand the core concept clearly", "Learn the key terminology", "See how it applies to real markets"],
    ["Apply the concept on a live chart", "Recognise common mistakes to avoid", "Practice with a worked example"],
]

TESTIMONIALS = [
    ("Aditya Kumar", "Software Engineer, Bengaluru", "The step-by-step structure finally made technical analysis click for me. I read charts now instead of guessing.", 5),
    ("Meera Iyer", "College Student, Chennai", "As a complete beginner I loved how the fundamentals were explained. The risk management module changed how I think about the market.", 5),
    ("Sanjay Patel", "Small Business Owner, Surat", "Clear, honest and practical. No hype about profits — just solid education I can learn at my own pace.", 5),
    ("Nisha Reddy", "Marketing Manager, Hyderabad", "The live sessions are fantastic for asking questions. The dashboard keeps me motivated to finish every lesson.", 5),
    ("Rahul Verma", "Bank Employee, Delhi", "I always found candlesticks confusing. After the candlestick and support-resistance modules, charts finally make sense.", 5),
    ("Priya Sharma", "Homemaker, Pune", "I started with zero knowledge. The beginner-friendly pace and simple language made it easy to keep going.", 5),
    ("Karthik Nair", "Mechanical Engineer, Kochi", "The trading psychology module was an eye-opener. It taught me discipline more than any indicator ever could.", 5),
    ("Ananya Ghosh", "Graphic Designer, Kolkata", "Being able to learn after work and track my progress lesson by lesson kept me consistent for weeks.", 5),
    ("Vikram Singh", "Army Veteran, Jaipur", "Structured, respectful of my time, and completely practical. The chart analysis examples are gold.", 5),
    ("Deepa Menon", "School Teacher, Trivandrum", "Everything is explained like a proper course, not random tips. I finally understand indicators like RSI and MACD.", 5),
    ("Arjun Desai", "CA Student, Ahmedabad", "Loved how risk management and position sizing were emphasised. It's education, not false promises.", 5),
    ("Sneha Joshi", "HR Executive, Nagpur", "The moving averages and trendline lessons were so clear. I recommend this to every beginner friend of mine.", 4),
    ("Mohammed Farhan", "Freelancer, Bengaluru", "The pace is perfect — you can go slow and rewatch anything. Support and resistance finally makes sense to me.", 5),
    ("Ritu Agarwal", "Entrepreneur, Indore", "Well organised modules and honest teaching. I appreciate that they never guarantee profits, just knowledge.", 5),
    ("Suresh Rao", "Retired Professor, Mysore", "At 61 I thought this would be hard. The beginner-friendly approach proved me wrong. Excellent structure.", 5),
    ("Pooja Malhotra", "Content Writer, Chandigarh", "The chart pattern module with real examples helped me connect theory to actual markets. Very practical.", 5),
    ("Ganesh Iyer", "IT Consultant, Mumbai", "Clean platform, clear lessons and useful live sessions. Learning at my own pace made all the difference.", 5),
    ("Tara Krishnan", "Medical Student, Vellore", "Simple explanations for complex topics. The fundamentals and options basics modules were especially helpful.", 5),
]




async def seed_all(db, hash_pw):
    # Course
    if not await db.courses.find_one({"course_id": COURSE_ID}):
        await db.courses.insert_one({
            "course_id": COURSE_ID,
            "title": "Basic to Advanced Stock Market Course",
            "description": "A complete, structured path from market fundamentals to advanced trading concepts — technical analysis, strategies, risk management and trading psychology.",
            "level": "Beginner to Advanced",
            "order": 1,
        })

    if await db.modules.count_documents({"course_id": COURSE_ID}) == 0:
        for mi, (title, desc) in enumerate(MODULES):
            module_id = f"mod_{mi+1:02d}"
            is_free_mod = mi < 2  # first two modules free
            await db.modules.insert_one({
                "module_id": module_id, "course_id": COURSE_ID, "title": title,
                "description": desc, "order": mi + 1, "is_free": is_free_mod,
            })
            for li in range(2):
                await db.lessons.insert_one({
                    "lesson_id": f"les_{mi+1:02d}_{li+1}",
                    "module_id": module_id,
                    "title": f"{title} — Part {li+1}",
                    "description": f"In this lesson we cover {title.lower()} in a clear, practical way. {desc}",
                    "objectives": OBJECTIVES[li],
                    "video_url": VIDEOS[(mi + li) % len(VIDEOS)],
                    "duration": f"{8 + li*4} min",
                    "order": li + 1,
                    "is_free": is_free_mod,
                })

    # Live sessions
    if await db.live_sessions.count_documents({}) == 0:
        base = datetime.now(timezone.utc)
        sessions = [
            ("Live Chart Reading: Candlesticks in Action", "Reading candlestick signals on live charts.", "Priya Nair", "10:00 AM IST", "Beginner"),
            ("Support & Resistance Masterclass", "Marking key zones and planning trades.", "Rahul Mehta", "07:00 PM IST", "Intermediate"),
            ("Risk Management Workshop", "Position sizing and protecting capital.", "Ananya Rao", "06:30 PM IST", "All Levels"),
            ("Options Basics Q&A", "Ask anything about calls, puts and premiums.", "Vikram Shah", "08:00 PM IST", "Beginner"),
        ]
        for i, (topic, desc, instr, time_s, level) in enumerate(sessions):
            d = base + timedelta(days=(i + 1) * 3)
            await db.live_sessions.insert_one({
                "id": str(uuid.uuid4()), "topic": topic, "description": desc,
                "date": d.strftime("%Y-%m-%d"), "time": time_s, "instructor": instr,
                "join_url": "", "level": level,
            })

    # Testimonials
    if await db.testimonials.count_documents({}) == 0:
        for t in TESTIMONIALS:
            await db.testimonials.insert_one({
                "id": str(uuid.uuid4()), "name": t[0], "role": t[1],
                "content": t[2], "rating": t[3], "avatar": "",
            })

    # Demo accounts
    if not await db.users.find_one({"email": "student@demo.com"}):
        await db.users.insert_one({
            "user_id": "user_demostudent", "name": "Demo Student", "email": "student@demo.com",
            "password_hash": hash_pw("Demo1234"), "role": "student", "picture": "",
            "auth_provider": "password", "created_at": datetime.now(timezone.utc).isoformat(),
        })
        # give demo student some completed lessons
        for lid in ["les_01_1", "les_01_2", "les_02_1"]:
            await db.progress.update_one(
                {"user_id": "user_demostudent", "lesson_id": lid},
                {"$set": {"completed": True, "completed_at": datetime.now(timezone.utc).isoformat()}}, upsert=True)

    if not await db.users.find_one({"email": "admin@demo.com"}):
        await db.users.insert_one({
            "user_id": "user_demoadmin", "name": "Admin", "email": "admin@demo.com",
            "password_hash": hash_pw("Admin1234"), "role": "admin", "picture": "",
            "auth_provider": "password", "created_at": datetime.now(timezone.utc).isoformat(),
        })
