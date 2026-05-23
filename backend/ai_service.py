import http.client
import json
import os
import time
import random
from datetime import datetime


def fetch_onthisday_events(month: int, day: int) -> list[dict]:
    """Fetch historical events using DashScope AI search."""
    api_key = os.getenv("DASHSCOPE_API_KEY")
    if not api_key:
        raise ValueError("DASHSCOPE_API_KEY not set")

    prompt = f"""请列举出{month}月{day}日在中国或世界历史上发生的5件真实历史事件。

要求：
1. 每件事必须是真实的历史事件
2. 包含具体的年份
3. 用简洁的语言描述事件（50字以内）
4. 事件要有历史意义，能引发人们的好奇心

请用JSON格式返回：
{{"events": [
  {{"year": 事件年份, "text": "事件描述"}},
  ...
]}}

直接返回JSON，不要有其他内容。"""

    conn = http.client.HTTPSConnection("dashscope.aliyuncs.com")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "qwen-plus",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1000,
        "temperature": 0.9,
    }

    try:
        conn.request("POST", "/compatible-mode/v1/chat/completions", body=json.dumps(payload), headers=headers)
        resp = conn.getresponse()
        data = json.loads(resp.read().decode())

        if not data.get("choices"):
            return []

        result_text = data["choices"][0]["message"]["content"]
        result = json.loads(result_text.strip())
        events = result.get("events", [])
        return [{"year": e.get("year", 0), "text": e.get("text", "")[:200]} for e in events if e.get("year")]
    except Exception:
        return []
    except Exception:
        return []


def rewrite_story_with_theme(month: int, day: int, theme: str, event: dict) -> dict:
    """
    Rewrite a real historical event into a bedtime story with the given theme.
    """
    api_key = os.getenv("DASHSCOPE_API_KEY")
    if not api_key:
        raise ValueError("DASHSCOPE_API_KEY not set")

    event_text = event.get("text", "")
    event_year = event.get("year", 0)

    prompt = f"""你是一位文笔优美的历史小说作家。现在是{month}月{day}日，在历史上的今天（{event_year}年），发生了这样一件事：

「{event_text}」

请将这个真实的历史事件，改写成一篇睡前历史故事。

【重要要求】：
- 正文必须不少于800字，分4-5个段落，用\\n\\n分隔
- 以这个真实事件为背景，用虚构的小人物视角叙述（工匠、书生、孩童、旅人、医生、教师等）
- 今日主题是「{theme}」，故事基调、情感氛围必须与此呼应，让故事弥漫着{theme}的意境
- 风格：平淡克制、细节丰富、情感含蓄，类似《我的阿勒泰》《给嬷嬷的情书》的笔触
- 每段要有具体的场景描写（天气、光线、声音、气味等）
- 结尾要有一句治愈人心的金句（15-25字）
- 【标题要求】：标题必须与主题词「{theme}」不同，要独特、有意境，不要直接使用主题词
- 【历史背景】：在故事正文结束后，另起一段，用"【历史背景】"开头，简要介绍这个真实历史事件（50-80字，客观描述）

请用JSON格式返回，包含以下字段：
- year: 历史年份（整数）
- location: 具体地点（如"北京城·故宫"）
- title: 故事标题（6-8字以内，与主题词不同，要有意境）
- narrator: 叙述者身份（简短描述，如"在琉璃厂开了三十年古玩铺的周掌柜")
- content: 正文+历史背景（正文不少于800字，最后附上【历史背景】段落，用\\n\\n分隔）
- golden_sentence: 金句（15-25字，治愈人心）
- image_prompts: 3个插画描述（每个20字内，水彩/水墨风格）

直接返回JSON，不要有其他内容。"""

    conn = http.client.HTTPSConnection("dashscope.aliyuncs.com")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "qwen-plus",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 4000,
        "temperature": 0.85,  # 稍降低以获得更稳定的长度
    }

    conn.request("POST", "/compatible-mode/v1/chat/completions", body=json.dumps(payload), headers=headers)
    response = conn.getresponse()
    data = json.loads(response.read().decode())

    if not data.get("choices"):
        raise Exception(f"DashScope story error: {data}")

    story_text = data["choices"][0]["message"]["content"]

    try:
        return json.loads(story_text.strip())
    except json.JSONDecodeError:
        start = story_text.find("{")
        end = story_text.rfind("}") + 1
        if start != -1:
            return json.loads(story_text[start:end])
        raise Exception(f"Failed to parse story: {story_text[:200]}")


def generate_story(month: int, day: int, theme: str = None) -> dict:
    """Generate a story by first fetching real events, then rewriting with theme."""
    # Step 1: Fetch real historical events
    events = fetch_onthisday_events(month, day)
    if not events:
        raise Exception("无法获取今日历史事件")

    # Pick a random event
    event = random.choice(events)

    # Step 2: Rewrite story with theme
    return rewrite_story_with_theme(month, day, theme or "浮生若梦", event)


def generate_image(prompt: str, seed_offset: int = 0) -> str:
    """
    Call DashScope wanx2.1-t2i-turbo to generate an illustration.
    Returns the image URL. Polls until the task completes.
    """
    api_key = os.getenv("DASHSCOPE_API_KEY")
    if not api_key:
        raise ValueError("DASHSCOPE_API_KEY not set")

    # 使用时间戳确保每次 seed 不同
    base_seed = int(time.time() * 1000) % 100000 + seed_offset + random.randint(1, 9999)

    conn = http.client.HTTPSConnection("dashscope.aliyuncs.com")

    # 简化 prompt，移除过长内容
    # 保留核心元素：场景、风格、氛围
    simple_prompt = prompt[:100] if len(prompt) > 100 else prompt

    payload = {
        "model": "wanx2.1-t2i-turbo",
        "input": {"prompt": simple_prompt},
        "parameters": {
            "size": "1024*1024",
            "seed": base_seed,
            "n": 1,
        },
    }

    # 使用正确的 API endpoint
    conn.request(
        "POST",
        "/api/v1/services/aigc/text2image/image-synthesis",
        body=json.dumps(payload),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "X-DashScope-Async": "enable",
        },
    )
    response = conn.getresponse()
    result = json.loads(response.read().decode())

    if "output" not in result or "task_id" not in result["output"]:
        raise Exception(f"Image task creation failed: {result}")

    task_id = result["output"]["task_id"]

    # 轮询等待任务完成
    for attempt in range(30):
        time.sleep(2)
        conn = http.client.HTTPSConnection("dashscope.aliyuncs.com")
        conn.request(
            "GET",
            f"/api/v1/tasks/{task_id}",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
        )
        resp = json.loads(conn.getresponse().read().decode())

        if "output" not in resp:
            continue

        status = resp["output"].get("task_status", "")
        if status == "SUCCEEDED":
            results = resp["output"].get("results", [])
            if results:
                return results[0].get("url") or results[0].get("image_url", "")
            # 检查其他可能的字段
            if "image_url" in resp["output"]:
                return resp["output"]["image_url"]
            raise Exception("No image URL in result")
        if status == "FAILED":
            raise Exception(f"Image generation failed: {resp}")

    raise Exception("Image generation timed out")


def generate_themes() -> list[str]:
    """Call DashScope to generate 3 poetic themes for bedtime storytelling."""
    api_key = os.getenv("DASHSCOPE_API_KEY")
    if not api_key:
        raise ValueError("DASHSCOPE_API_KEY not set")

    # 使用随机数确保每次请求不同
    seed = random.randint(1, 10000)

    prompt = f"""你是一位富有诗意的文案创作者。请为睡前历史故事生成3个富有意境的主题词（随机种子：{seed}）。

要求：
1. 每个主题词2-5个字，要诗意、能打动人，三个词必须完全不同
2. 风格：空灵、温暖、怀旧、治愈
3. 从以下词库中随机选择3个不同的词：
   - 时光类：浮生若梦、星河流转、时光渡口、岁岁年年、流光碎影、光阴慢递、岁月如歌
   - 自然类：月照归途、灯火阑珊、烟雨江南、山高水长、云深不知、风起天涯、春山可望
   - 情感类：卿卿如晤、如歌岁月、烟火人间、故人入梦、远方的信、记得那年、相望天涯
   - 书卷类：灯下旧卷、墨香如故、纸短情长、青简微光、砚池春暖、松风旧诺、笔端心事
   - 旅途类：舟行夜色、驿站灯火、归帆未远、天涯倦客、相逢在途、别离如风、路远马亡

请用JSON格式返回：
{{"themes": ["主题1", "主题2", "主题3"]}}

直接返回JSON，不要有其他内容。"""

    conn = http.client.HTTPSConnection("dashscope.aliyuncs.com")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "qwen-plus",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 500,
        "temperature": 1.2,  # 更高的温度增加多样性
    }

    conn.request("POST", "/compatible-mode/v1/chat/completions", body=json.dumps(payload), headers=headers)
    response = conn.getresponse()
    data = json.loads(response.read().decode())

    if not data.get("choices"):
        raise Exception(f"DashScope themes error: {data}")

    story_text = data["choices"][0]["message"]["content"]
    try:
        result = json.loads(story_text.strip())
        return result.get("themes", [])
    except json.JSONDecodeError:
        start = story_text.find("{")
        end = story_text.rfind("}") + 1
        if start != -1:
            return json.loads(story_text[start:end]).get("themes", [])
        raise Exception(f"Failed to parse themes: {story_text[:200]}")