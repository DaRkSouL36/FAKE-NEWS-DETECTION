from transformers import pipeline  # IMPORTS THE HUGGING FACE PIPELINE FOR TEXT GENERATION
import logging                     # IMPORTS PYTHON'S STANDARD LOGGING MODULE
import re                          # IMPORTS REGULAR EXPRESSION MODULE FOR FLEXIBLE TEXT EXTRACTION

class LLMExplainer:
    def __init__(self):
        """
        INITIALIZES THE TEXT GENERATION PIPELINE FOR EFFICIENT CPU USAGE.
        CONFIGURES THE MODEL FOR OPTIMAL PERFORMANCE AND RESPONSE QUALITY.
        """
        try:
            # CREATES THE GENERATION PIPELINE USING A LIGHTWEIGHT, CPU-FRIENDLY MODEL.
            self.generator = pipeline(
                task="text-generation",      # DEFINES THE TASK AS TEXT GENERATION
                model="microsoft/phi-2",     # SELECTS THE PHI-2 MODEL FOR BALANCED SPEED AND QUALITY
                device_map="cpu",            # ENSURES THE MODEL RUNS ON CPU ONLY
                torch_dtype="auto",          # AUTOMATICALLY SELECTS THE BEST DATA TYPE FOR HARDWARE
                max_new_tokens=192,          # LIMITS THE NUMBER OF TOKENS GENERATED FOR OUTPUT
                do_sample=True,              # ENABLES CONTROLLED RANDOMNESS FOR MORE NATURAL RESPONSES
                temperature=0.5              # BALANCES CREATIVITY AND FACTUALNESS IN OUTPUT
            )
            logging.info("LLM EXPLAINER INITIALIZED SUCCESSFULLY")  # LOGS SUCCESSFUL INITIALIZATION
        except Exception as init_error:
            logging.critical(f"LLM INIT FAILED: {str(init_error)}") # LOGS CRITICAL ERRORS DURING INITIALIZATION
            raise

    def explain(self, article_text, prediction):
        """
        GENERATES A FACTUAL, HUMAN-READABLE EXPLANATION FOR THE MODEL'S PREDICTION.

        PARAMETERS:
        article_text (str): THE NEWS ARTICLE CONTENT TO ANALYZE.
        prediction (str): THE MODEL'S CLASSIFICATION LABEL ('REAL' OR 'FAKE').

        RETURNS:
        str: A STRUCTURED, NATURAL-LANGUAGE EXPLANATION WITH A SOURCE DISCLAIMER.
        """
        try:
            # TRUNCATES THE ARTICLE TO THE FIRST 256 WORDS TO FIT WITHIN THE MODEL'S CONTEXT WINDOW.
            truncated_text = ' '.join(article_text.split()[:256])

            # BUILDS A NATURAL-LANGUAGE PROMPT TO INSTRUCT THE LLM TO EXPLAIN ITS CLASSIFICATION.
            prompt_template = (
                f"You are an expert fact-checker. Read the following news article and explain, in 2 to 4 sentences, exactly why it is classified as {prediction.upper()}. "
                f"Base your explanation only on the article content, focusing on source credibility, evidence quality, and logical consistency. "
                f"When possible, cite specific facts or statements from the article to support your explanation. "
                f"Do not repeat the article text. Do not include any questions, disclaimers, or instructions. "
                f"Only provide the explanation. "
                f"\n\nARTICLE:\n{truncated_text}\n\nEXPLANATION:"
            )
            
            # GENERATES THE EXPLANATION USING THE LLM WITH STRICT OUTPUT LIMITS AND RELIABLE TERMINATION.
            generation_result = self.generator(
                prompt_template,              # PROVIDES THE STRUCTURED PROMPT TO THE LLM
                max_new_tokens=192,           # LIMITS THE LENGTH OF THE GENERATED EXPLANATION
                num_return_sequences=1,       # ENSURES ONLY ONE EXPLANATION IS RETURNED
                truncation=True,              # GUARANTEES THE PROMPT FITS THE MODEL'S CONTEXT
                pad_token_id=self.generator.tokenizer.eos_token_id  # ENSURES PROPER OUTPUT TERMINATION
            )

            # RETRIEVES THE RAW GENERATED TEXT FROM THE MODEL'S OUTPUT.
            raw_output = generation_result[0]['generated_text']

            # USES REGULAR EXPRESSION TO EXTRACT THE EXPLANATION TEXT IN A CASE-INSENSITIVE WAY.
            match = re.split(r'EXPLANATION:\s*', raw_output, flags=re.IGNORECASE)
            if len(match) > 1:
                explanation = match[-1].strip()   # TAKES TEXT AFTER THE 'EXPLANATION:' MARKER
            else:
                explanation = raw_output.strip()  # FALLBACK: USES THE WHOLE OUTPUT IF MARKER IS MISSING

            # REMOVES ANY ACCIDENTAL ECHO OF THE ARTICLE & MARKDOWN FROM THE EXPLANATION.
            explanation = re.sub(rf'^{re.escape(truncated_text[:100])}', '', explanation)
            explanation = re.sub(r'\*\*|\*|__|_', '', explanation).strip()

            # CLEANS AND FORMATS THE FINAL EXPLANATION FOR USER DISPLAY.
            clean_explanation = explanation.strip()
            # IF THE EXPLANATION IS TOO SHORT, PROVIDES A DEFAULT MESSAGE TO THE USER.
            if len(clean_explanation) < 60:
                clean_explanation = "EXPLANATION UNAVAILABLE OR TOO SHORT."

            # RETURNS THE FINAL EXPLANATION WITH A SOURCE DISCLAIMER.
            return f"{clean_explanation} \n(SOURCE: AI FACT-CHECKING SYSTEM)"

        except Exception as gen_error:
            # LOGS ANY ERRORS THAT OCCUR DURING THE EXPLANATION GENERATION PROCESS.
            logging.error(f"EXPLANATION FAILED: {str(gen_error)}\nRAW OUTPUT: {raw_output}\nPROMPT: {prompt_template}")
            # RETURNS A USER-FRIENDLY MESSAGE IF AN ERROR OCCURS.
            return "EXPLANATION TEMPORARILY UNAVAILABLE DUE TO TECHNICAL DIFFICULTIES. \n(SOURCE: AI FACT-CHECKING SYSTEM)"
