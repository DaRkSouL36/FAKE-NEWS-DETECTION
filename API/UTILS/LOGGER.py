import logging  # IMPORTING THE LOGGING MODULE FOR LOGGING MESSAGES

# CONFIGURING THE LOGGING SYSTEM
logging.basicConfig(
    level=logging.INFO,                                    # SETTING THE LOGGING LEVEL TO INFO (THIS WILL LOG INFO AND HIGHER SEVERITY MESSAGES)
    format='[%(asctime)s] - %(levelname)s - %(message)s',  # LOGGING FORMAT: TIMESTAMP, LOG LEVEL, AND MESSAGE
    handlers=[ 
        logging.StreamHandler()                            # DISPLAY LOG MESSAGES ON THE CONSOLE
    ]
)

# CREATING A LOGGER INSTANCE NAMED "FakeNewsAPI"
logger = logging.getLogger("FakeNewsAPI")                   # GETTING A LOGGER NAMED "FakeNewsAPI" TO LOG MESSAGES SPECIFIC TO THIS API