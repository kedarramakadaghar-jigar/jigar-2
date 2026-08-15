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
        data = [
            ("Aditya Kumar", "Software Engineer", "The step-by-step structure finally made technical analysis click for me. I understand charts instead of guessing.", 5),
            ("Meera Iyer", "Student", "As a complete beginner I loved how the fundamentals were explained. The risk management module changed how I think about trading.", 5),
            ("Sanjay Patel", "Small Business Owner", "Clear, honest and practical. No hype about profits — just solid education I can learn at my own pace.", 5),
            ("Nisha Reddy", "Marketing Manager", "The live sessions are fantastic for asking questions. The dashboard keeps me motivated to finish lessons.", 4),
        ]
        for name, role, content, rating in data:
            await db.testimonials.insert_one({
                "id": str(uuid.uuid4()), "name": name, "role": role,
                "content": content, "rating": rating, "avatar": "",
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
