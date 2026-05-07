// js/audio-tts.js
(function () {
    "use strict";
  
    const synth = window.speechSynthesis;
  
    function cleanText(text = "") {
      return String(text)
        .replace(/<[^>]*>/g, "")
        .replace(/\n/g, ". ")
        .replace(/\s+/g, " ")
        .trim();
    }
  
    function getVoice() {
      const voices = synth.getVoices();
      return (
        voices.find((v) => v.lang === "id-ID") ||
        voices.find((v) => v.lang.includes("id")) ||
        voices[0]
      );
    }
  
    function speak(text) {
      if (!text) return;
  
      synth.cancel();
  
      const utter = new SpeechSynthesisUtterance(cleanText(text));
      utter.lang = "id-ID";
      utter.rate = 0.9;
      utter.pitch = 1;
      utter.volume = 1;
  
      const voice = getVoice();
      if (voice) utter.voice = voice;
  
      synth.speak(utter);
    }
  
    function stop() {
      synth.cancel();
    }
  
    window.SD_AUDIO = {
      speak,
      stop,
      cleanText
    };
  })();