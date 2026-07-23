import { Modal, View, TouchableOpacity, StyleSheet } from 'react-native';
import { AppText } from '@/components/AppText';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from '@/i18n';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  onAllow: () => void;
  onDeny: () => void;
}

export function PermissionDialog({ visible, title, message, onAllow, onDeny }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={[styles.dialog, { backgroundColor: colors.surfaceHigh, borderColor: colors.primaryContainer }]}>
          <AppText style={[styles.title, { color: colors.onSurface }]}>{title}</AppText>
          <AppText style={[styles.message, { color: colors.onSurfaceVariant }]}>{message}</AppText>
          <View style={styles.buttons}>
            <TouchableOpacity onPress={onDeny} style={[styles.btn, { borderColor: colors.outline }]}>
              <AppText style={[styles.btnText, { color: colors.onSurface }]}>{t('common.cancel')}</AppText>
            </TouchableOpacity>
            <TouchableOpacity onPress={onAllow} style={[styles.btn, { backgroundColor: colors.primaryContainer }]}>
              <AppText style={[styles.btnText, { color: colors.onPrimaryContainer }]}>{t('common.allow')}</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  dialog: { width: '85%', borderRadius: 12, borderWidth: 1, padding: 24 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  message: { fontSize: 14, marginBottom: 24, lineHeight: 20 },
  buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  btn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  btnText: { fontSize: 14, fontWeight: '600' },
});
