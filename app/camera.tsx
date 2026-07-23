import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import { useSetAtom } from 'jotai';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from '@/i18n';
import { MemoriesRepository } from '@/repositories/MemoriesRepository';
import { trackEvent } from '@/services/AnalyticsService';
import { updateQuestProgress } from '@/services/QuestService';
import { questVersionAtom, questCompleteQueueAtom } from '@/stores/questStore';
import { companionAtom } from '@/stores/companionStore';
import { coinsAtom } from '@/stores/currencyStore';
import { CompanionRepository } from '@/repositories/CompanionRepository';
import { stripImageExif } from '@/utils/stripImageExif';

const memoriesRepo = new MemoriesRepository();
const companionRepo = new CompanionRepository();

export default function CameraScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { achievementId } = useLocalSearchParams<{ achievementId?: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [saving, setSaving] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const setQuestVersion = useSetAtom(questVersionAtom);
  const setQuestCompleteQueue = useSetAtom(questCompleteQueueAtom);
  const setCompanion = useSetAtom(companionAtom);
  const setCoins = useSetAtom(coinsAtom);

  if (!permission) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primaryContainer} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.msg, { color: colors.onSurface }]}>{t('camera.permissionNeeded')}</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primaryContainer }]} onPress={requestPermission}>
          <Text style={{ color: colors.onPrimaryContainer, fontWeight: '700' }}>{t('common.allow')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current || saving) return;
    setSaving(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (!photo?.uri) return;

      const strippedUri = await stripImageExif(photo.uri);
      const dir = `${FileSystem.documentDirectory}memories/`;
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      const dest = `${dir}${Date.now()}.jpg`;
      await FileSystem.copyAsync({ from: strippedUri, to: dest });

      if (achievementId) {
        await memoriesRepo.save(achievementId, dest);
        await trackEvent('camera_memory_saved', { achievementId });
      }

      const completed = await updateQuestProgress('photo', 1);
      setQuestVersion((v) => v + 1);
      if (completed.length > 0) {
        setQuestCompleteQueue((prev) => [
          ...prev,
          ...completed.filter((id) => !prev.includes(id)),
        ]);
        for (const questId of completed) {
          await trackEvent('quest_complete', { questId });
        }
      }
      const companion = await companionRepo.get();
      if (companion) {
        setCompanion(companion);
        setCoins(companion.coins);
      }

      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ponytail: animateShutter 預設 true 會白閃；封測不要快門閃光效果 */}
      <CameraView ref={cameraRef} style={styles.camera} facing="back" flash="off" animateShutter={false} />
      <View style={[styles.controls, { paddingBottom: Math.max(insets.bottom, 16) + 24 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.controlBtn}>
          <Text style={styles.controlText}>{t('common.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={takePhoto} style={[styles.shutter, { borderColor: colors.primaryContainer }]} disabled={saving}>
          {saving ? <ActivityIndicator /> : <View style={[styles.shutterInner, { backgroundColor: colors.primaryContainer }]} />}
        </TouchableOpacity>
        <View style={styles.controlBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  msg: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  btn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24 },
  controlBtn: { width: 80 },
  controlText: { color: '#fff', fontSize: 16 },
  shutter: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, justifyContent: 'center', alignItems: 'center' },
  shutterInner: { width: 56, height: 56, borderRadius: 28 },
});
