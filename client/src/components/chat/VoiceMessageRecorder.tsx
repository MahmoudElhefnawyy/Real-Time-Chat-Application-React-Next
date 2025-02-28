import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause, Send, Trash } from "lucide-react";
import RecordRTC from 'recordrtc';

interface VoiceMessageRecorderProps {
  onSend: (audioBlob: Blob) => void;
  onCancel: () => void;
}

export default function VoiceMessageRecorder({ onSend, onCancel }: VoiceMessageRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const recorderRef = useRef<RecordRTC | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorderRef.current = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/webm',
        sampleRate: 44100,
        desiredSampRate: 16000,
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1
      });
      
      recorderRef.current.startRecording();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stopRecording(() => {
        const blob = recorderRef.current!.getBlob();
        setAudioBlob(blob);
        setIsRecording(false);

        // Stop all tracks on the stream
        const stream = recorderRef.current!.getInternalRecorder().stream;
        stream.getTracks().forEach(track => track.stop());
      });
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current || !audioBlob) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob);
      setAudioBlob(null);
    }
  };

  const handleCancel = () => {
    setAudioBlob(null);
    onCancel();
  };

  return (
    <div className="p-4 bg-muted/50 rounded-lg space-y-2">
      {audioBlob ? (
        <>
          <audio 
            ref={audioRef} 
            src={URL.createObjectURL(audioBlob)} 
            onEnded={() => setIsPlaying(false)} 
            className="hidden" 
          />
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayPause}
              className="h-8 w-8"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <div className="flex-1 h-1 bg-muted-foreground/20 rounded">
              <div className="h-full w-0 bg-primary rounded" style={{ width: '0%' }} />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSend}
              className="h-8 w-8 text-primary"
            >
              <Send className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-8 w-8 text-destructive"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <Button
          variant={isRecording ? "destructive" : "secondary"}
          onClick={isRecording ? stopRecording : startRecording}
          className="w-full"
        >
          {isRecording ? (
            <>
              <Square className="h-4 w-4 mr-2" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 mr-2" />
              Start Recording
            </>
          )}
        </Button>
      )}
    </div>
  );
}
