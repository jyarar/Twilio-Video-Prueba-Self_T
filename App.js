import React, { useRef, useState } from 'react';
import {
  TwilioVideoLocalView,
  TwilioVideoParticipantView,
  TwilioVideo
} from 'react-native-twilio-video-webrtc';



export default function App(props) {
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [status, setStatus] = useState('disconnected');
    const [participants, setParticipants] = useState(new Map());
    const [videoTracks, setVideoTracks] = useState(new Map());
    const [token, setToken] = useState('');
    const twilioRef = useRef(null);

    const _onConnectButtonPress = () => {
      twilioRef.current.connect({ accessToken: token });
      setStatus('connecting');
    }

    const _onEndButtonPress = () => {
      twilioRef.current.disconnect();
    };

    const _onMuteButtonPress = () => {
      twilioRef.current
          .setLocalAudioEnabled(!isAudioEnabled)
          .then(isEnabled => setIsAudioEnabled(isEnabled));
    };

    const _onFlipButtonPress = () => {
      twilioRef.current.flipCamera();
    };

    const _onRoomDidConnect = ({roomName, error}) => {
      console.log('onRoomDidConnect: ', roomName);

      setStatus('connected');
    };

    const _onRoomDidDisconnect = ({ roomName, error }) => {
      console.log('[Disconnect]ERROR: ', error);

      setStatus('disconnected');
    };

    const _onRoomDidFailToConnect = error => {
      console.log('[FailToConnect]ERROR: ', error);

      setStatus('disconnected');
    };

    const _onParticipantAddedVideoTrack = ({ participant, track }) => {
      console.log('onParticipantAddedVideoTrack: ', participant, track);

      setVideoTracks(
          new Map([
            ...videoTracks,
            [
              track.trackSid,
              { participantSid: participant.sid, videoTrackSid: track.trackSid },
            ],
          ]),
      );
    };

    const _onParticipantRemovedVideoTrack = ({ participant, track }) => {
      console.log('onParticipantRemovedVideoTrack: ', participant, track);

      const videoTracksLocal = videoTracks;
      videoTracksLocal.delete(track.trackSid);

      setVideoTracks(videoTracksLocal);
    };

    return (
        <View style={styles.container}>
          {
              status === 'disconnected' &&
              <View>
                <Text style={styles.welcome}>
                  React Native Twilio Video
                </Text>
                <TextInput
                    style={styles.input}
                    autoCapitalize='none'
                    value={token}
                    onChangeText={(text) => setToken(text)}>
                </TextInput>
                <Button
                    title="Connect"
                    style={styles.button}
                    onPress={_onConnectButtonPress}>
                </Button>
              </View>
          }

          {
              (status === 'connected' || status === 'connecting') &&
              <View style={styles.callContainer}>
                {
                    status === 'connected' &&
                    <View style={styles.remoteGrid}>
                      {
                        Array.from(videoTracks, ([trackSid, trackIdentifier]) => {
                          return (
                              <TwilioVideoParticipantView
                                  style={styles.remoteVideo}
                                  key={trackSid}
                                  trackIdentifier={trackIdentifier}
                              />
                          )
                        })
                      }
                    </View>
                }
                <View
                    style={styles.optionsContainer}>
                  <TouchableOpacity
                      style={styles.optionButton}
                      onPress={_onEndButtonPress}>
                    <Text style={{fontSize: 12}}>End</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                      style={styles.optionButton}
                      onPress={_onMuteButtonPress}>
                    <Text style={{fontSize: 12}}>{ isAudioEnabled ? "Mute" : "Unmute" }</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                      style={styles.optionButton}
                      onPress={_onFlipButtonPress}>
                    <Text style={{fontSize: 12}}>Flip</Text>
                  </TouchableOpacity>
                  <TwilioVideoLocalView
                      enabled={true}
                      style={styles.localVideo}
                  />
                </View>
              </View>
          }

          <TwilioVideo
              ref={ twilioRef }
              onRoomDidConnect={ _onRoomDidConnect }
              onRoomDidDisconnect={ _onRoomDidDisconnect }
              onRoomDidFailToConnect= { _onRoomDidFailToConnect }
              onParticipantAddedVideoTrack={ _onParticipantAddedVideoTrack }
              onParticipantRemovedVideoTrack= { _onParticipantRemovedVideoTrack }
          />
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
