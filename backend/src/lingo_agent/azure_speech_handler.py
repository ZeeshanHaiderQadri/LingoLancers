"""
Azure Speech Services Integration
Cost-effective alternative to Deepgram with 400+ voices
"""

import os
import asyncio
from typing import Optional, Callable
import logging

try:
    import azure.cognitiveservices.speech as speechsdk
    AZURE_SPEECH_AVAILABLE = True
except ImportError:
    AZURE_SPEECH_AVAILABLE = False
    print("Azure Speech SDK not available. Install: pip install azure-cognitiveservices-speech")

logger = logging.getLogger(__name__)


class AzureSpeechHandler:
    """
    Azure Speech Services for STT and TTS
    
    Features:
    - 140+ languages
    - 400+ neural voices
    - Real-time transcription
    - Custom voices support
    - SSML support
    - Much cheaper than Deepgram!
    
    Cost:
    - STT: $1 per hour = $0.017/minute
    - TTS: $4-16 per 1M chars = $0.004/minute
    - Total: ~$0.021/minute (vs Deepgram $0.019/minute)
    """
    
    def __init__(
        self,
        speech_key: Optional[str] = None,
        speech_region: Optional[str] = None
    ):
        self.speech_key = speech_key or os.getenv("AZURE_SPEECH_KEY")
        self.speech_region = speech_region or os.getenv("AZURE_SPEECH_REGION", "swedencentral")
        
        # Initialize defaults
        self.available = False
        self.speech_config = None
        self.voice_name = "en-US-JennyNeural"
        self.is_listening = False
        self.is_speaking = False
        self.on_transcript: Optional[Callable] = None
        self.on_final_transcript: Optional[Callable] = None
        
        if not AZURE_SPEECH_AVAILABLE:
            logger.error("Azure Speech SDK not installed. Run: pip install azure-cognitiveservices-speech")
            return
        
        if not self.speech_key:
            logger.warning("Azure Speech key not configured. Set AZURE_SPEECH_KEY environment variable")
            return
        
        try:
            # Create speech config
            self.speech_config = speechsdk.SpeechConfig(
                subscription=self.speech_key,
                region=self.speech_region
            )
            
            # Default voice (can be changed)
            self.speech_config.speech_synthesis_voice_name = self.voice_name
            
            # Recognition config
            self.speech_config.speech_recognition_language = "en-US"
            
            self.available = True
            logger.info(f"✓ Azure Speech initialized (Region: {self.speech_region})")
            
        except Exception as e:
            logger.error(f"Failed to initialize Azure Speech: {e}")
            self.available = False
    
    async def start_continuous_recognition(
        self,
        on_transcript: Callable[[str, bool], None]
    ):
        """
        Start continuous speech recognition
        
        Args:
            on_transcript: Callback(text, is_final)
        """
        if not self.available:
            logger.error("Azure Speech not available")
            return False
        
        try:
            # ✅ FIX: Store the main event loop for thread-safe callback scheduling
            main_loop = asyncio.get_running_loop()
            
            # Create recognizer
            audio_config = speechsdk.audio.AudioConfig(use_default_microphone=True)
            self.recognizer = speechsdk.SpeechRecognizer(
                speech_config=self.speech_config,
                audio_config=audio_config
            )
            
            # ✅ FIX: Create wrapper function to properly schedule async callback
            async def schedule_transcript(text: str, is_final: bool):
                """Wrapper to schedule transcript callback"""
                try:
                    await on_transcript(text, is_final)
                except Exception as e:
                    logger.error(f"Error in transcript callback: {e}")
            
            # Set up event handlers
            def recognizing_handler(evt):
                """Interim results"""
                if evt.result.reason == speechsdk.ResultReason.RecognizingSpeech:
                    text = evt.result.text
                    if text and on_transcript:
                        # ✅ FIX: Use run_coroutine_threadsafe with wrapper function
                        try:
                            asyncio.run_coroutine_threadsafe(
                                schedule_transcript(text, False),
                                main_loop
                            )
                        except Exception as e:
                            logger.error(f"Error scheduling transcript callback: {e}")
            
            def recognized_handler(evt):
                """Final results"""
                if evt.result.reason == speechsdk.ResultReason.RecognizedSpeech:
                    text = evt.result.text
                    if text and on_transcript:
                        # ✅ FIX: Use run_coroutine_threadsafe with wrapper function
                        try:
                            asyncio.run_coroutine_threadsafe(
                                schedule_transcript(text, True),
                                main_loop
                            )
                        except Exception as e:
                            logger.error(f"Error scheduling transcript callback: {e}")
            
            def canceled_handler(evt):
                """Handle errors"""
                logger.error(f"Recognition canceled: {evt}")
            
            # Connect handlers
            self.recognizer.recognizing.connect(recognizing_handler)
            self.recognizer.recognized.connect(recognized_handler)
            self.recognizer.canceled.connect(canceled_handler)
            
            # Start continuous recognition
            self.recognizer.start_continuous_recognition()
            
            self.is_listening = True
            logger.info("✓ Continuous recognition started")
            return True
            
        except Exception as e:
            logger.error(f"Error starting recognition: {e}")
            return False
    
    async def stop_recognition(self):
        """Stop continuous recognition"""
        if hasattr(self, 'recognizer'):
            self.recognizer.stop_continuous_recognition()
            self.is_listening = False
            logger.info("Recognition stopped")
    
    async def stop_listening(self):
        """Alias for stop_recognition for compatibility"""
        await self.stop_recognition()
    
    async def start_listening(
        self,
        on_transcript: Callable[[str, bool], None],
        on_interrupt: Optional[Callable] = None
    ):
        """
        Alias for start_continuous_recognition for compatibility
        
        Args:
            on_transcript: Callback for transcript updates (text, is_final)
            on_interrupt: Callback when user interrupts (not used in Azure)
        """
        return await self.start_continuous_recognition(on_transcript)
    
    async def recognize_once(self) -> Optional[str]:
        """
        Recognize speech once (single utterance)
        
        Returns:
            Recognized text or None
        """
        if not self.available:
            return None
        
        try:
            audio_config = speechsdk.audio.AudioConfig(use_default_microphone=True)
            recognizer = speechsdk.SpeechRecognizer(
                speech_config=self.speech_config,
                audio_config=audio_config
            )
            
            result = recognizer.recognize_once()
            
            if result.reason == speechsdk.ResultReason.RecognizedSpeech:
                return result.text
            elif result.reason == speechsdk.ResultReason.NoMatch:
                logger.warning("No speech recognized")
                return None
            elif result.reason == speechsdk.ResultReason.Canceled:
                logger.error(f"Recognition canceled: {result.cancellation_details}")
                return None
            
        except Exception as e:
            logger.error(f"Error in recognition: {e}")
            return None
    
    async def synthesize_to_buffer(self, text: str, voice: Optional[str] = None, language: Optional[str] = None) -> bytes:
        """
        Synthesize speech to an in-memory audio buffer (WAV) and return raw bytes.
        This is used by the /api/voice/tts endpoint to provide audio data to the frontend.
        
        Args:
            text: Text to synthesize
            voice: Optional voice name to override default
            language: Optional language code (not used by Azure directly but good for context)
        """
        if not self.available:
            raise RuntimeError('Azure Speech not available')
        try:
            # Ensure voice config is set
            if not self.speech_config:
                raise RuntimeError('Speech config not initialized')
            
            # Create a local speech config to avoid race conditions with singleton
            # We clone the config by creating a new one with same key/region
            # Note: SpeechConfig doesn't have a clone method, so we create new or modify a copy if possible.
            # Actually, we can just set the property on the synthesizer's config if we create a new config.
            # But creating a new config every time might be overhead.
            # Better: Create config from subscription again.
            
            local_speech_config = speechsdk.SpeechConfig(
                subscription=self.speech_key,
                region=self.speech_region
            )
            
            # Set voice on local config
            target_voice = voice or self.voice_name
            local_speech_config.speech_synthesis_voice_name = target_voice
            
            # Create synthesizer with NO audio output (returns data in result)
            synthesizer = speechsdk.SpeechSynthesizer(
                speech_config=local_speech_config,
                audio_config=None  # None returns audio in result.audio_data
            )
            
            # Run in thread pool to avoid blocking event loop
            loop = asyncio.get_running_loop()
            
            def _synthesize():
                result = synthesizer.speak_text_async(text).get()
                return result

            result = await loop.run_in_executor(None, _synthesize)
            
            if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                # result.audio_data is a bytearray containing the audio (WAV)
                return bytes(result.audio_data)
            else:
                cancellation_details = result.cancellation_details
                error_msg = f"Speech synthesis failed: {result.reason}"
                if cancellation_details.reason == speechsdk.CancellationReason.Error:
                    error_msg += f" Error details: {cancellation_details.error_details}"
                raise RuntimeError(error_msg)
        except Exception as e:
            logger.error(f"Error in synthesize_to_buffer: {e}")
            raise e
    
    async def speak(
        self,
        text: str,
        voice: Optional[str] = None,
        interruptible: bool = True
    ) -> bool:
        """
        Convert text to speech and play
        
        Args:
            text: Text to speak
            voice: Voice name (optional, uses default if not specified)
            interruptible: Whether speech can be interrupted (for compatibility, not used)
        
        Returns:
            True if successful
        """
        if not self.available:
            logger.error("Azure Speech not available")
            return False
        
        try:
            self.is_speaking = True
            
            # Update voice if specified
            if voice:
                self.speech_config.speech_synthesis_voice_name = voice
            
            # Create synthesizer
            audio_config = speechsdk.audio.AudioOutputConfig(use_default_speaker=True)
            synthesizer = speechsdk.SpeechSynthesizer(
                speech_config=self.speech_config,
                audio_config=audio_config
            )
            
            # Synthesize
            result = synthesizer.speak_text_async(text).get()
            
            if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                logger.info(f"✓ Spoke: {text[:50]}...")
                self.is_speaking = False
                return True
            elif result.reason == speechsdk.ResultReason.Canceled:
                cancellation = result.cancellation_details
                logger.error(f"Speech synthesis canceled: {cancellation.reason}")
                self.is_speaking = False
                return False
            
        except Exception as e:
            logger.error(f"Error in speech synthesis: {e}")
            self.is_speaking = False
            return False
    
    async def speak_ssml(self, ssml: str) -> bool:
        """
        Speak using SSML for advanced control
        
        SSML allows:
        - Speed control
        - Pitch control
        - Emphasis
        - Pauses
        - Multiple voices
        
        Example:
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
            <voice name="en-US-JennyNeural">
                <prosody rate="fast" pitch="high">
                    Hello! I'm speaking quickly and with high pitch.
                </prosody>
            </voice>
        </speak>
        """
        if not self.available:
            return False
        
        try:
            audio_config = speechsdk.audio.AudioOutputConfig(use_default_speaker=True)
            synthesizer = speechsdk.SpeechSynthesizer(
                speech_config=self.speech_config,
                audio_config=audio_config
            )
            
            result = synthesizer.speak_ssml_async(ssml).get()
            
            return result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted
            
        except Exception as e:
            logger.error(f"Error in SSML synthesis: {e}")
            return False
    
    def set_voice(self, voice_name: str, language: str = "en"):
        """
        Change voice
        
        Args:
            voice_name: Azure voice name (e.g., "en-US-AriaNeural")
            language: Language code (not used for Azure, kept for compatibility)
        
        Popular voices:
        
        English (US) Female:
        - en-US-JennyNeural (friendly, warm)
        - en-US-AriaNeural (professional)
        - en-US-SaraNeural (conversational)
        
        English (US) Male:
        - en-US-GuyNeural (professional)
        - en-US-DavisNeural (friendly)
        - en-US-TonyNeural (authoritative)
        
        English (UK):
        - en-GB-SoniaNeural (British female)
        - en-GB-RyanNeural (British male)
        
        Other languages:
        - ar-SA-ZariyahNeural (Arabic)
        - zh-CN-XiaoxiaoNeural (Chinese)
        - es-ES-ElviraNeural (Spanish)
        - fr-FR-DeniseNeural (French)
        - de-DE-KatjaNeural (German)
        - hi-IN-SwaraNeural (Hindi)
        - ja-JP-NanamiNeural (Japanese)
        
        Full list: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support
        """
        self.voice_name = voice_name
        self.speech_config.speech_synthesis_voice_name = voice_name
        logger.info(f"Voice changed to: {voice_name}")
    
    def set_language(self, language: str):
        """
        Change recognition language
        
        Examples:
        - en-US (English US)
        - en-GB (English UK)
        - es-ES (Spanish)
        - fr-FR (French)
        - de-DE (German)
        - zh-CN (Chinese)
        - ja-JP (Japanese)
        - ar-SA (Arabic)
        - hi-IN (Hindi)
        """
        self.speech_config.speech_recognition_language = language
        logger.info(f"Recognition language changed to: {language}")
    
    def get_available_voices(self) -> dict:
        """
        Get comprehensive list of Azure Neural voices
        Supports 140+ languages and 400+ voices
        """
        return {
            "english_us": {
                "female": [
                    "en-US-AriaNeural",
                    "en-US-JennyNeural",
                    "en-US-SaraNeural",
                    "en-US-MichelleNeural",
                    "en-US-MonicaNeural",
                    "en-US-AshleyNeural",
                    "en-US-CoraNeural",
                    "en-US-ElizabethNeural",
                    "en-US-AmberNeural",
                    "en-US-AnaNeural"
                ],
                "male": [
                    "en-US-GuyNeural",
                    "en-US-DavisNeural",
                    "en-US-TonyNeural",
                    "en-US-JasonNeural",
                    "en-US-ChristopherNeural",
                    "en-US-EricNeural",
                    "en-US-JacobNeural",
                    "en-US-RogerNeural",
                    "en-US-SteffanNeural",
                    "en-US-BrandonNeural"
                ]
            },
            "english_uk": {
                "female": [
                    "en-GB-SoniaNeural",
                    "en-GB-LibbyNeural",
                    "en-GB-MiaNeural",
                    "en-GB-BellaNeural",
                    "en-GB-HollieNeural"
                ],
                "male": [
                    "en-GB-RyanNeural",
                    "en-GB-ThomasNeural",
                    "en-GB-AlfieNeural",
                    "en-GB-ElliotNeural",
                    "en-GB-EthanNeural"
                ]
            },
            "english_other": {
                "australia": ["en-AU-NatashaNeural", "en-AU-WilliamNeural", "en-AU-AnnetteNeural", "en-AU-CarlyNeural"],
                "canada": ["en-CA-ClaraNeural", "en-CA-LiamNeural"],
                "india": ["en-IN-NeerjaNeural", "en-IN-PrabhatNeural"],
                "ireland": ["en-IE-EmilyNeural", "en-IE-ConnorNeural"],
                "new_zealand": ["en-NZ-MollyNeural", "en-NZ-MitchellNeural"],
                "south_africa": ["en-ZA-LeahNeural", "en-ZA-LukeNeural"],
                "singapore": ["en-SG-LunaNeural", "en-SG-WayneNeural"]
            },
            "arabic": {
                "saudi_arabia": ["ar-SA-ZariyahNeural", "ar-SA-HamedNeural"],
                "egypt": ["ar-EG-SalmaNeural", "ar-EG-ShakirNeural"],
                "uae": ["ar-AE-FatimaNeural", "ar-AE-HamdanNeural"],
                "bahrain": ["ar-BH-LailaNeural", "ar-BH-AliNeural"],
                "algeria": ["ar-DZ-AminaNeural", "ar-DZ-IsmaelNeural"],
                "iraq": ["ar-IQ-RanaNeural", "ar-IQ-BasselNeural"],
                "jordan": ["ar-JO-SanaNeural", "ar-JO-TaimNeural"],
                "kuwait": ["ar-KW-NouraNeural", "ar-KW-FahedNeural"],
                "libya": ["ar-LY-ImanNeural", "ar-LY-OmarNeural"],
                "morocco": ["ar-MA-MounaNeural", "ar-MA-JamalNeural"],
                "oman": ["ar-OM-AyshaNeural", "ar-OM-AbdullahNeural"],
                "qatar": ["ar-QA-AmalNeural", "ar-QA-MoazNeural"],
                "syria": ["ar-SY-AmanyNeural", "ar-SY-LaithNeural"],
                "tunisia": ["ar-TN-ReemNeural", "ar-TN-HediNeural"],
                "yemen": ["ar-YE-MaryamNeural", "ar-YE-SalehNeural"]
            },
            "chinese": {
                "mandarin": ["zh-CN-XiaoxiaoNeural", "zh-CN-YunxiNeural", "zh-CN-YunjianNeural", "zh-CN-XiaoyiNeural"],
                "cantonese": ["zh-HK-HiuMaanNeural", "zh-HK-WanLungNeural", "zh-HK-HiuGaaiNeural"],
                "taiwan": ["zh-TW-HsiaoChenNeural", "zh-TW-YunJheNeural", "zh-TW-HsiaoYuNeural"]
            },
            "spanish": {
                "spain": ["es-ES-ElviraNeural", "es-ES-AlvaroNeural", "es-ES-AbrilNeural", "es-ES-ArnauNeural"],
                "mexico": ["es-MX-DaliaNeural", "es-MX-JorgeNeural", "es-MX-BeatrizNeural"],
                "argentina": ["es-AR-ElenaNeural", "es-AR-TomasNeural"],
                "colombia": ["es-CO-SalomeNeural", "es-CO-GonzaloNeural"],
                "chile": ["es-CL-CatalinaNeural", "es-CL-LorenzoNeural"],
                "peru": ["es-PE-CamilaNeural", "es-PE-AlexNeural"],
                "venezuela": ["es-VE-PaolaNeural", "es-VE-SebastianNeural"],
                "cuba": ["es-CU-BelkysNeural", "es-CU-ManuelNeural"],
                "dominican_republic": ["es-DO-RamonaNeural", "es-DO-EmilioNeural"],
                "ecuador": ["es-EC-AndreaNeural", "es-EC-LuisNeural"],
                "guatemala": ["es-GT-MartaNeural", "es-GT-AndresNeural"],
                "honduras": ["es-HN-KarlaNeural", "es-HN-CarlosNeural"],
                "nicaragua": ["es-NI-YolandaNeural", "es-NI-FedericoNeural"],
                "panama": ["es-PA-MargaritaNeural", "es-PA-RobertoNeural"],
                "paraguay": ["es-PY-TaniaNeural", "es-PY-MarioNeural"],
                "puerto_rico": ["es-PR-KarinaNeural", "es-PR-VictorNeural"],
                "el_salvador": ["es-SV-LorenaNeural", "es-SV-RodrigoNeural"],
                "uruguay": ["es-UY-ValentinaNeural", "es-UY-MateoNeural"],
                "bolivia": ["es-BO-SofiaNeural", "es-BO-MarceloNeural"],
                "costa_rica": ["es-CR-MariaNeural", "es-CR-JuanNeural"]
            },
            "french": {
                "france": ["fr-FR-DeniseNeural", "fr-FR-HenriNeural", "fr-FR-BrigitteNeural", "fr-FR-AlainNeural"],
                "canada": ["fr-CA-SylvieNeural", "fr-CA-AntoineNeural", "fr-CA-JeanNeural"],
                "belgium": ["fr-BE-CharlineNeural", "fr-BE-GerardNeural"],
                "switzerland": ["fr-CH-ArianeNeural", "fr-CH-FabriceNeural"]
            },
            "german": {
                "germany": ["de-DE-KatjaNeural", "de-DE-ConradNeural", "de-DE-AmalaNeural", "de-DE-BerndNeural"],
                "austria": ["de-AT-IngridNeural", "de-AT-JonasNeural"],
                "switzerland": ["de-CH-LeniNeural", "de-CH-JanNeural"]
            },
            "hindi": {
                "india": ["hi-IN-SwaraNeural", "hi-IN-MadhurNeural"]
            },
            "urdu": {
                "pakistan": ["ur-PK-UzmaNeural", "ur-PK-AsadNeural"],
                "india": ["ur-IN-GulNeural", "ur-IN-SalmanNeural"]
            },
            "japanese": {
                "japan": ["ja-JP-NanamiNeural", "ja-JP-KeitaNeural", "ja-JP-AoiNeural", "ja-JP-DaichiNeural"]
            },
            "korean": {
                "korea": ["ko-KR-SunHiNeural", "ko-KR-InJoonNeural", "ko-KR-BongJinNeural", "ko-KR-GookMinNeural"]
            },
            "portuguese": {
                "brazil": ["pt-BR-FranciscaNeural", "pt-BR-AntonioNeural", "pt-BR-BrendaNeural", "pt-BR-DonatoNeural"],
                "portugal": ["pt-PT-RaquelNeural", "pt-PT-DuarteNeural", "pt-PT-FernandaNeural"]
            },
            "russian": {
                "russia": ["ru-RU-SvetlanaNeural", "ru-RU-DmitryNeural", "ru-RU-DariyaNeural"]
            },
            "italian": {
                "italy": ["it-IT-ElsaNeural", "it-IT-IsabellaNeural", "it-IT-DiegoNeural", "it-IT-BenignoNeural"]
            },
            "dutch": {
                "netherlands": ["nl-NL-ColetteNeural", "nl-NL-MaartenNeural", "nl-NL-FennaNeural"],
                "belgium": ["nl-BE-DenaNeural", "nl-BE-ArnaudNeural"]
            },
            "polish": {
                "poland": ["pl-PL-AgnieszkaNeural", "pl-PL-MarekNeural", "pl-PL-ZofiaNeural"]
            },
            "turkish": {
                "turkey": ["tr-TR-EmelNeural", "tr-TR-AhmetNeural"]
            },
            "vietnamese": {
                "vietnam": ["vi-VN-HoaiMyNeural", "vi-VN-NamMinhNeural"]
            },
            "thai": {
                "thailand": ["th-TH-PremwadeeNeural", "th-TH-NiwatNeural", "th-TH-AcharaNeural"]
            },
            "indonesian": {
                "indonesia": ["id-ID-GadisNeural", "id-ID-ArdiNeural"]
            },
            "malay": {
                "malaysia": ["ms-MY-YasminNeural", "ms-MY-OsmanNeural"]
            },
            "filipino": {
                "philippines": ["fil-PH-BlessicaNeural", "fil-PH-AngeloNeural"]
            },
            "bengali": {
                "india": ["bn-IN-TanishaaNeural", "bn-IN-BashkarNeural"],
                "bangladesh": ["bn-BD-NabanitaNeural", "bn-BD-PradeepNeural"]
            },
            "tamil": {
                "india": ["ta-IN-PallaviNeural", "ta-IN-ValluvarNeural"],
                "sri_lanka": ["ta-LK-SaranyaNeural", "ta-LK-KumarNeural"],
                "singapore": ["ta-SG-VenbaNeural", "ta-SG-AnbuNeural"],
                "malaysia": ["ta-MY-KaniNeural", "ta-MY-SuryaNeural"]
            },
            "telugu": {
                "india": ["te-IN-ShrutiNeural", "te-IN-MohanNeural"]
            },
            "marathi": {
                "india": ["mr-IN-AarohiNeural", "mr-IN-ManoharNeural"]
            },
            "gujarati": {
                "india": ["gu-IN-DhwaniNeural", "gu-IN-NiranjanNeural"]
            },
            "kannada": {
                "india": ["kn-IN-SapnaNeural", "kn-IN-GaganNeural"]
            },
            "malayalam": {
                "india": ["ml-IN-SobhanaNeural", "ml-IN-MidhunNeural"]
            },
            "punjabi": {
                "india": ["pa-IN-SukhNeural", "pa-IN-GaganNeural"]
            },
            "greek": {
                "greece": ["el-GR-AthinaNeural", "el-GR-NestorasNeural"]
            },
            "swedish": {
                "sweden": ["sv-SE-SofieNeural", "sv-SE-MattiasNeural", "sv-SE-HilleviNeural"]
            },
            "norwegian": {
                "norway": ["nb-NO-PernilleNeural", "nb-NO-FinnNeural", "nb-NO-IselinNeural"]
            },
            "danish": {
                "denmark": ["da-DK-ChristelNeural", "da-DK-JeppeNeural"]
            },
            "finnish": {
                "finland": ["fi-FI-NooraNeural", "fi-FI-HarriNeural", "fi-FI-SelmaNeural"]
            },
            "czech": {
                "czech_republic": ["cs-CZ-VlastaNeural", "cs-CZ-AntoninNeural"]
            },
            "hungarian": {
                "hungary": ["hu-HU-NoemiNeural", "hu-HU-TamasNeural"]
            },
            "romanian": {
                "romania": ["ro-RO-AlinaNeural", "ro-RO-EmilNeural"]
            },
            "bulgarian": {
                "bulgaria": ["bg-BG-KalinaNeural", "bg-BG-BorislavNeural"]
            },
            "croatian": {
                "croatia": ["hr-HR-GabrijelaNeural", "hr-HR-SreckoNeural"]
            },
            "serbian": {
                "serbia": ["sr-RS-SophieNeural", "sr-RS-NicholasNeural"]
            },
            "slovak": {
                "slovakia": ["sk-SK-ViktoriaNeural", "sk-SK-LukasNeural"]
            },
            "slovenian": {
                "slovenia": ["sl-SI-PetraNeural", "sl-SI-RokNeural"]
            },
            "ukrainian": {
                "ukraine": ["uk-UA-PolinaNeural", "uk-UA-OstapNeural"]
            },
            "hebrew": {
                "israel": ["he-IL-HilaNeural", "he-IL-AvriNeural"]
            },
            "persian": {
                "iran": ["fa-IR-DilaraNeural", "fa-IR-FaridNeural"]
            },
            "swahili": {
                "kenya": ["sw-KE-ZuriNeural", "sw-KE-RafikiNeural"],
                "tanzania": ["sw-TZ-RehemaNeural", "sw-TZ-DaudiNeural"]
            },
            "afrikaans": {
                "south_africa": ["af-ZA-AdriNeural", "af-ZA-WillemNeural"]
            },
            "amharic": {
                "ethiopia": ["am-ET-MekdesNeural", "am-ET-AmehaNeural"]
            },
            "azerbaijani": {
                "azerbaijan": ["az-AZ-BanuNeural", "az-AZ-BabekNeural"]
            },
            "bosnian": {
                "bosnia": ["bs-BA-VesnaNeural", "bs-BA-GoranNeural"]
            },
            "catalan": {
                "spain": ["ca-ES-JoanaNeural", "ca-ES-EnricNeural", "ca-ES-AlbaNeural"]
            },
            "estonian": {
                "estonia": ["et-EE-AnuNeural", "et-EE-KertNeural"]
            },
            "galician": {
                "spain": ["gl-ES-SabelaNeural", "gl-ES-RoiNeural"]
            },
            "icelandic": {
                "iceland": ["is-IS-GudrunNeural", "is-IS-GunnarNeural"]
            },
            "kazakh": {
                "kazakhstan": ["kk-KZ-AigulNeural", "kk-KZ-DauletNeural"]
            },
            "khmer": {
                "cambodia": ["km-KH-SreymomNeural", "km-KH-PisethNeural"]
            },
            "lao": {
                "laos": ["lo-LA-KeomanyNeural", "lo-LA-ChanthavongNeural"]
            },
            "latvian": {
                "latvia": ["lv-LV-EveritaNeural", "lv-LV-NilsNeural"]
            },
            "lithuanian": {
                "lithuania": ["lt-LT-OnaNeural", "lt-LT-LeonasNeural"]
            },
            "macedonian": {
                "north_macedonia": ["mk-MK-MarijaNeural", "mk-MK-AleksandarNeural"]
            },
            "maltese": {
                "malta": ["mt-MT-GraceNeural", "mt-MT-JosephNeural"]
            },
            "mongolian": {
                "mongolia": ["mn-MN-YesuiNeural", "mn-MN-BataaNeural"]
            },
            "nepali": {
                "nepal": ["ne-NP-HemkalaNeural", "ne-NP-SagarNeural"]
            },
            "sinhala": {
                "sri_lanka": ["si-LK-ThiliniNeural", "si-LK-SameeraNeural"]
            },
            "somali": {
                "somalia": ["so-SO-UbaxNeural", "so-SO-MuuseNeural"]
            },
            "sundanese": {
                "indonesia": ["su-ID-TutiNeural", "su-ID-JajangNeural"]
            },
            "uzbek": {
                "uzbekistan": ["uz-UZ-MadinaNeural", "uz-UZ-SardorNeural"]
            },
            "welsh": {
                "uk": ["cy-GB-NiaNeural", "cy-GB-AledNeural"]
            },
            "zulu": {
                "south_africa": ["zu-ZA-ThandoNeural", "zu-ZA-ThembaNeural"]
            }
        }


# Singleton instance
_speech_instance: Optional[AzureSpeechHandler] = None


def get_azure_speech() -> AzureSpeechHandler:
    """Get or create Azure Speech instance"""
    global _speech_instance
    
    if _speech_instance is None:
        _speech_instance = AzureSpeechHandler()
    
    return _speech_instance
