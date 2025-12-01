import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

import { useAuth } from "../../contexts/AuthContext";
import { getWorkouts } from "../../services/supabase/workouts";
import { theme } from "../../styles/theme";
import { typography } from "../../styles/typography";

// ============================================================================
// CONSTANTS
// ============================================================================

const SCREEN_WIDTH = Dimensions.get("window").width;

const TIME_PERIODS = [
  { id: "week", label: "Semana" },
  { id: "month", label: "Mês" },
  { id: "3months", label: "3 Meses" },
  { id: "year", label: "Ano" },
];

const STATS_CARDS = [
  {
    id: "pr",
    icon: "trophy",
    title: "Recorde Pessoal",
    value: "120 Kg",
    color: theme.colors.primary,
  },
  {
    id: "distance",
    icon: "walk",
    title: "Distância Total",
    value: "42 Km",
    color: theme.colors.primary,
  },
  {
    id: "calories",
    icon: "flame",
    title: "Calorias Queimadas",
    value: "5.000 Kcal",
    color: theme.colors.primary,
  },
  {
    id: "time",
    icon: "time",
    title: "Tempo Total",
    value: "12h 30m",
    color: theme.colors.primary,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const calculateWeeklyData = (workouts) => {
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const data = new Array(7).fill(0);

  // Simular dados de peso levantado por dia
  workouts.forEach((workout) => {
    const totalWeight =
      workout.workout_exercises?.reduce((sum, ex) => {
        return sum + ex.sets * ex.reps * ex.weight;
      }, 0) || 0;

    // Distribuir aleatoriamente na semana (simulação)
    const randomDay = Math.floor(Math.random() * 7);
    data[randomDay] += totalWeight;
  });

  return { labels: weekDays, data };
};

const calculateTotalWeight = (workouts) => {
  return workouts.reduce((total, workout) => {
    const workoutWeight =
      workout.workout_exercises?.reduce((sum, ex) => {
        return sum + ex.sets * ex.reps * ex.weight;
      }, 0) || 0;
    return total + workoutWeight;
  }, 0);
};

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

const StatCard = ({ icon, title, value, color }) => {
  return (
    <View style={styles.statCard}>
      <View
        style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );
};

// ============================================================================
// GOAL PROGRESS COMPONENT
// ============================================================================

const GoalProgress = ({ title, progress }) => {
  return (
    <View style={styles.goalCard}>
      <View style={styles.goalHeader}>
        <Text style={styles.goalTitle}>{title}</Text>
        <Text style={styles.goalPercentage}>{progress}%</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
    </View>
  );
};

// ============================================================================
// EXERCISE EVOLUTION COMPONENT
// ============================================================================

const ExerciseEvolution = ({ exercise, onPress }) => {
  return (
    <TouchableOpacity style={styles.evolutionCard} onPress={onPress}>
      <View style={styles.evolutionInfo}>
        <Text style={styles.evolutionName}>{exercise.name}</Text>
        <Text style={styles.evolutionData}>{exercise.data}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={theme.colors.textSecondary}
      />
    </TouchableOpacity>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ProgressScreen = () => {
  const { user } = useAuth();

  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState({ labels: [], data: [] });
  const [totalWeight, setTotalWeight] = useState(0);

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  useEffect(() => {
    loadProgressData();
  }, [user]);

  const loadProgressData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await getWorkouts(user.id);

      if (!error && data) {
        setWorkouts(data);

        // Calcular dados do gráfico
        const weekData = calculateWeeklyData(data);
        setChartData(weekData);

        // Calcular peso total levantado
        const total = calculateTotalWeight(data);
        setTotalWeight(total);
      }
    } catch (error) {
      console.error("Erro ao carregar progresso:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handlePeriodChange = (periodId) => {
    setSelectedPeriod(periodId);
    // TODO: Implementar filtro por período
  };

  const handleShareProgress = () => {
    console.log("Compartilhar progresso");
  };

  const handleExercisePress = (exercise) => {
    console.log("Ver evolução do exercício:", exercise);
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando progresso...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={styles.headerTitle}>Meu Progresso</Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShareProgress}
        >
          <Ionicons name="share-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Time Period Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            {TIME_PERIODS.map((period) => (
              <TouchableOpacity
                key={period.id}
                style={[
                  styles.filterButton,
                  selectedPeriod === period.id && styles.filterButtonActive,
                ]}
                onPress={() => handlePeriodChange(period.id)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedPeriod === period.id && styles.filterTextActive,
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Weight Evolution Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Evolução do Peso Levantado (Kg)</Text>
          <Text style={styles.chartValue}>
            {totalWeight.toLocaleString()} Kg
          </Text>

          <View style={styles.chartMetrics}>
            <Text style={styles.chartMetricLabel}>Semana</Text>
            <Text style={styles.chartMetricValue}>+15%</Text>
          </View>

          {chartData.data.length > 0 && (
            <LineChart
              data={{
                labels: chartData.labels,
                datasets: [
                  { data: chartData.data.length > 0 ? chartData.data : [0] },
                ],
              }}
              width={SCREEN_WIDTH - 48}
              height={200}
              chartConfig={{
                backgroundColor: theme.colors.background,
                backgroundGradientFrom: theme.colors.background,
                backgroundGradientTo: theme.colors.background,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(124, 252, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(169, 169, 169, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: theme.colors.primary,
                },
              }}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={false}
            />
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {STATS_CARDS.map((stat) => (
            <StatCard
              key={stat.id}
              icon={stat.icon}
              title={stat.title}
              value={stat.value}
              color={stat.color}
            />
          ))}
        </View>

        {/* Goals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minhas Metas</Text>
          <GoalProgress title="Correr 5km" progress={80} />
          <GoalProgress title="Levantar 100kg no supino" progress={50} />
        </View>

        {/* Exercise Evolution Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evolução por Exercício</Text>
          <ExerciseEvolution
            exercise={{ name: "Supino Reto", data: "80kg (+5kg)" }}
            onPress={() => handleExercisePress("Supino Reto")}
          />
          <ExerciseEvolution
            exercise={{ name: "Agachamento", data: "110kg (+10kg)" }}
            onPress={() => handleExercisePress("Agachamento")}
          />
          <ExerciseEvolution
            exercise={{ name: "Corrida na Esteira", data: "5km (+0.5km)" }}
            onPress={() => handleExercisePress("Corrida")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    ...typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  headerLeft: {
    width: 40,
  },

  headerTitle: {
    ...typography.h1,
    fontSize: theme.fontSizes.lg,
    fontWeight: "700",
  },

  shareButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },

  // Filters
  filtersContainer: {
    paddingVertical: theme.spacing.md,
  },

  filters: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },

  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.sm,
  },

  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },

  filterText: {
    ...typography.body,
    fontSize: theme.fontSizes.sm,
    fontWeight: "600",
    color: theme.colors.text,
  },

  filterTextActive: {
    color: theme.colors.background,
    fontWeight: "700",
  },

  // Chart Section
  chartSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },

  chartTitle: {
    ...typography.body,
    fontSize: theme.fontSizes.md,
    fontWeight: "600",
    marginBottom: theme.spacing.xs,
  },

  chartValue: {
    ...typography.h1,
    fontSize: 32,
    fontWeight: "700",
    marginBottom: theme.spacing.xs,
  },

  chartMetrics: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },

  chartMetricLabel: {
    ...typography.body,
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
  },

  chartMetricValue: {
    ...typography.body,
    fontSize: theme.fontSizes.md,
    fontWeight: "700",
    color: theme.colors.primary,
  },

  chart: {
    marginVertical: theme.spacing.sm,
    borderRadius: 16,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },

  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },

  statInfo: {
    gap: 4,
  },

  statTitle: {
    ...typography.body,
    fontSize: theme.fontSizes.md,
    fontWeight: "700",
    color: theme.colors.text,
  },

  statValue: {
    ...typography.body,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },

  // Section
  section: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },

  sectionTitle: {
    ...typography.body,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: theme.spacing.md,
  },

  // Goal Progress
  goalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },

  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },

  goalTitle: {
    ...typography.body,
    fontSize: theme.fontSizes.md,
    fontWeight: "600",
  },

  goalPercentage: {
    ...typography.body,
    fontSize: theme.fontSizes.md,
    fontWeight: "700",
    color: theme.colors.primary,
  },

  progressBarContainer: {
    width: "100%",
    height: 10,
    backgroundColor: theme.colors.border,
    borderRadius: 5,
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
  },

  // Exercise Evolution
  evolutionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },

  evolutionInfo: {
    flex: 1,
  },

  evolutionName: {
    ...typography.body,
    fontSize: theme.fontSizes.md,
    fontWeight: "600",
    marginBottom: 4,
  },

  evolutionData: {
    ...typography.body,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
});

export default ProgressScreen;
