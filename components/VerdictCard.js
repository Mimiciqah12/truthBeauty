import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

const VerdictCard = ({ analysisData }) => {
  if (!analysisData) return null;

  const getTheme = (status) => {
    switch (status?.toLowerCase()) {
      case 'safe':
        return { color: '#10B981', bg: '#ECFDF5', icon: 'shield-check' }; 
      case 'caution':
        return { color: '#F59E0B', bg: '#FFFBEB', icon: 'alert-circle-outline' }; 
      case 'avoid':
        return { color: '#EF4444', bg: '#FEF2F2', icon: 'skull-outline' }; 
      default:
        return { color: '#6B7280', bg: '#F3F4F6', icon: 'help-circle-outline' }; 
    }
  };

  const theme = getTheme(analysisData.overall_status);

  return (
    <View style={[styles.card, { borderColor: theme.color }]}>

      <View style={[styles.header, { backgroundColor: theme.color }]}>
        <View style={styles.headerTitleContainer}>
          <MaterialCommunityIcons name={theme.icon} size={24} color="#FFF" />
          <Text style={styles.headerTitle}>
            {analysisData.verdict_title || "Analysis Result"}
          </Text>
        </View>

        {analysisData.health_score && (
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{analysisData.health_score}/100</Text>
          </View>
        )}
      </View>

      <View style={[styles.body, { backgroundColor: theme.bg }]}>
        <Text style={[styles.label, { color: theme.color }]}>
          AI SUMMARY
        </Text>

        <Text style={styles.description}>
          {analysisData.verdict_description 
            ? analysisData.verdict_description 
            : "No detailed summary available provided by AI."}
        </Text>

        {analysisData.key_ingredients && analysisData.key_ingredients.length > 0 && (
          <View style={styles.highlightContainer}>
            <Text style={styles.highlightLabel}>Key Ingredients Detected:</Text>
            <View style={styles.tagsWrapper}>
              {analysisData.key_ingredients.map((item, index) => (
                <View key={index} style={[styles.tag, { borderColor: theme.color }]}>
                  <Text style={[styles.tagText, { color: theme.color }]}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  scoreBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  scoreText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  body: {
    padding: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 1,
  },
  description: {
    fontSize: 15,
    color: '#374151', 
    lineHeight: 24, 
    textAlign: 'justify',
  },
  highlightContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 15,
  },
  highlightLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  }
});

export default VerdictCard;