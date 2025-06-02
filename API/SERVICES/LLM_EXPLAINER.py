from transformers import pipeline  # IMPORTS THE HUGGINGFACE PIPELINE FOR TEXT GENERATION

class LLMExplainer:
    def __init__(self):
        # INITIALIZES THE TEXT-GENERATION PIPELINE WITH THE LLAMA-3 8B MODEL
        self.generator = pipeline(
            "text-generation",
            model="meta-llama/Llama-3-8b"
        )

    def explain(self, article_text, prediction):
        # CALCULATES THE LENGTH OF THE ARTICLE IN WORDS
        article_length = len(article_text.split())

        # DYNAMICALLY SETS THE MAXIMUM TOKEN LENGTH FOR THE EXPLANATION
        # SHORT ARTICLES GET SHORTER EXPLANATIONS, LONG ARTICLES GET LONGER ONES
        if article_length < 100:
            max_tokens = 192  # FOR VERY SHORT ARTICLES (~3 LINES)
        elif article_length < 300:
            max_tokens = 256  # FOR MEDIUM ARTICLES (~4–5 LINES)
        else:
            max_tokens = 320  # FOR LONG ARTICLES (~5–6 LINES)

        # BUILDS THE PROMPT IN UPPERCASE TO INSTRUCT THE MODEL CLEARLY
        # INCLUDES SPECIFIC CRITERIA FOR CLASSIFICATION EXPLANATION
        prompt = (
            f"YOU ARE AN EXPERT MISINFORMATION ANALYST. READ THE FOLLOWING NEWS ARTICLE CAREFULLY. "
            f"THEN EXPLAIN IN A CONCISE, EVIDENCE-BASED MANNER WHY IT IS LIKELY TO BE CLASSIFIED AS '{prediction.upper()}'. "
            f"YOUR EXPLANATION SHOULD CONSIDER:\n"
            f"- THE CREDIBILITY OF THE SOURCES USED\n"
            f"- THE PRESENCE OF UNSUPPORTED CLAIMS OR LOGICAL FALLACIES\n"
            f"- ANY KNOWN MISINFORMATION CUES (E.G., SENSATIONALISM, LACK OF ATTRIBUTION, CONSPIRACY LANGUAGE)\n"
            f"\nARTICLE:\n{article_text.upper()}\n"
            f"\nBASED ON YOUR ANALYSIS, PROVIDE A CLEAR AND FACTUAL EXPLANATION IN 2 TO 6 SENTENCES.\n"
            f"\nEXPLANATION:"
        )

        # CALLS THE LLAMA MODEL TO GENERATE THE EXPLANATION BASED ON THE PROMPT
        result = self.generator(
            prompt,
            max_length=max_tokens,
            do_sample=False,       # DISABLES SAMPLING FOR MORE CONSISTENT OUTPUT
            temperature=0.7,       # SETS TEMPERATURE TO BALANCE CREATIVITY AND RELIABILITY
            top_p=0.9,             # NUCLEUS SAMPLING TO CONTROL OUTPUT DIVERSITY
            top_k=50               # LIMITS TO TOP 50 CANDIDATE TOKENS
        )

        # EXTRACTS ONLY THE GENERATED EXPLANATION TEXT AFTER THE "EXPLANATION:" KEYWORD
        # CONVERTS THE OUTPUT TO UPPERCASE FOR CONSISTENCY
        explanation = result[0]["generated_text"].split("EXPLANATION:")[-1].strip().upper()

        # RETURNS THE FINAL EXPLANATION WITH A DISCLAIMER
        return explanation + " (THIS IS AN AI-GENERATED EXPLANATION.)"
