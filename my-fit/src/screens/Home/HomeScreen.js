import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { useAuth } from "../../contexts/AuthContext";
import { getWorkouts } from "../../services/supabase/workouts";
import { theme } from "../../styles/theme";
import { typography } from "../../styles/typography";

// ============================================================================
// CONSTANTS
// ============================================================================

const WORKOUT_IMAGES = {
  alongamento:
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
  yoga: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
  corrida:
    "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=80",
  cardio:
    "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=80",
  força:
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80",
  peso: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80",
  peito:
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80",
  default:
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getWorkoutImage = (name) => {
  const lowerName = name.toLowerCase();
  for (const [key, image] of Object.entries(WORKOUT_IMAGES)) {
    if (key !== "default" && lowerName.includes(key)) {
      return image;
    }
  }
  return WORKOUT_IMAGES.default;
};

const calculateStats = (workouts) => {
  const totalMinutes = workouts.reduce((sum, workout) => {
    const workoutMinutes =
      workout.workout_exercises?.reduce((wSum, ex) => {
        // Estima: (séries × reps × 3 segundos) + (séries × descanso)
        const exerciseTime =
          (ex.sets * ex.reps * 3 + ex.sets * ex.rest_seconds) / 60;
        return wSum + exerciseTime;
      }, 0) || 0;
    return sum + workoutMinutes;
  }, 0);

  const totalCalories = Math.round(totalMinutes * 7.8); // ~7.8 kcal/min em treino

  return {
    calories: totalCalories,
    minutes: Math.round(totalMinutes),
  };
};

const calculateWeeklyProgress = (workouts) => {
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const today = new Date().getDay();
  const progressData = new Array(7).fill(0);

  workouts.forEach((workout) => {
    const workoutDate = new Date(workout.created_at);
    const dayOfWeek = workoutDate.getDay();

    // Calcula minutos deste treino
    const workoutMinutes =
      workout.workout_exercises?.reduce((sum, ex) => {
        const exerciseTime =
          (ex.sets * ex.reps * 3 + ex.sets * ex.rest_seconds) / 60;
        return sum + exerciseTime;
      }, 0) || 0;

    // Ajusta índice (segunda = 0, domingo = 6)
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    progressData[adjustedDay] += workoutMinutes;
  });

  const maxValue = Math.max(...progressData, 1);

  return days.map((day, index) => {
    // Ajusta o índice do "hoje" (segunda = 0)
    const todayAdjusted = today === 0 ? 6 : today - 1;

    return {
      day,
      minutes: Math.round(progressData[index]),
      percentage: (progressData[index] / maxValue) * 100,
      isToday: index === todayAdjusted,
    };
  });
};

// ============================================================================
// PROGRESS CHART COMPONENT
// ============================================================================

const ProgressChart = ({ data }) => {
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>Minutos de treino</Text>
        <View style={styles.progressPeriod}>
          <Text style={styles.progressPeriodText}>Esta semana</Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={theme.colors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.chartContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.barContainer}>
            <View style={styles.barWrapper}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${Math.max(item.percentage, 5)}%`,
                    backgroundColor:
                      item.minutes > 0
                        ? theme.colors.primary
                        : `${theme.colors.primary}30`,
                  },
                ]}
              />
            </View>
            <Text
              style={[styles.dayLabel, item.isToday && styles.dayLabelActive]}
            >
              {item.day}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const StatCard = ({ label, value }) => {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
};

// ============================================================================
// WORKOUT CARD COMPONENT
// ============================================================================

const WorkoutCard = ({ workout, onStart }) => {
  const exerciseCount = workout.workout_exercises?.length || 0;

  // Calcula tempo estimado do treino
  const estimatedMinutes =
    workout.workout_exercises?.reduce((sum, ex) => {
      const exerciseTime =
        (ex.sets * ex.reps * 3 + ex.sets * ex.rest_seconds) / 60;
      return sum + exerciseTime;
    }, 0) || 15;

  return (
    <View style={styles.workoutCard}>
      {/* Imagem do Treino */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: getWorkoutImage(workout.name) }}
          style={styles.workoutImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
      </View>

      {/* Conteúdo do Card */}
      <View style={styles.cardContent}>
        <View style={styles.cardInfo}>
          <Text style={styles.workoutTitle} numberOfLines={1}>
            {workout.name}
          </Text>
          <Text style={styles.workoutDuration}>
            {Math.round(estimatedMinutes)} min
          </Text>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={onStart}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>Iniciar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, userProfile } = useAuth();

  const [workouts, setWorkouts] = useState([]);
  const [stats, setStats] = useState({ calories: 0, minutes: 0 });
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const userName =
    userProfile?.full_name ||
    user?.raw_user_meta_data?.full_name ||
    user?.email?.split("@")[0] ||
    "Maria";

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const { data, error } = await getWorkouts(user.id);

      if (error) throw error;

      const allWorkouts = data || [];
      setWorkouts(allWorkouts);

      const calculatedStats = calculateStats(allWorkouts);
      setStats(calculatedStats);

      const progressData = calculateWeeklyProgress(allWorkouts);
      setWeeklyProgress(progressData);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [user])
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const onRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData();
  };

  const handleStartWorkout = (workoutId) => {
    navigation.navigate("WorkoutsTab", {
      screen: "WorkoutDetail",
      params: { workoutId },
    });
  };

  const handleCreateWorkout = () => {
    navigation.navigate("WorkoutsTab", {
      screen: "CreateWorkout",
    });
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header com Avatar e Notificação */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              {userProfile?.avatar_url ? (
                <Image
                  source={{ uri: userProfile.avatar_url }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarPlaceholder} />
              )}
            </View>
            <Text style={styles.greeting}>Olá, {userName}!</Text>
          </View>

          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Cards de Estatísticas */}
        <View style={styles.statsContainer}>
          <StatCard
            label="Calorias queimadas"
            value={`${stats.calories} kcal`}
          />
          <StatCard label="Tempo de treino" value={`${stats.minutes} min`} />
        </View>

        {/* Seção de Treinos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Treinos do dia</Text>

          {workouts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="barbell-outline"
                size={64}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.emptyTitle}>Nenhum treino criado</Text>
              <Text style={styles.emptyText}>
                Comece criando seu primeiro treino personalizado
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateWorkout}
              >
                <Ionicons
                  name="add"
                  size={24}
                  color={theme.colors.background}
                />
                <Text style={styles.createButtonText}>Criar Treino</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.workoutsScroll}
            >
              {workouts.slice(0, 5).map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  onStart={() => handleStartWorkout(workout.id)}
                />
              ))}
            </ScrollView>
          )}
        </View>
        {/* Gráfico de Progresso */}
        <Text style={styles.sectionTitle}>Seu Progresso</Text>
        {weeklyProgress.length > 0 && (
          <View style={styles.chartSection}>
            <ProgressChart data={weeklyProgress} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 100,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.primary,
    opacity: 0.3,
  },

  greeting: {
    ...typography.h1,
    fontSize: 20,
    fontWeight: "700",
  },

  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },

  // Stats Container
  statsContainer: {
    flexDirection: "row",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },

  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.md,
    minHeight: 90,
    justifyContent: "center",
  },

  statLabel: {
    ...typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    fontWeight: "500",
  },

  statValue: {
    ...typography.h1,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
  },

  // Chart Section
  chartSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },

  progressContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: theme.spacing.md,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },

  progressTitle: {
    ...typography.body,
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },

  progressPeriod: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  progressPeriodText: {
    ...typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },

  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 160,
    paddingBottom: theme.spacing.sm,
  },

  barContainer: {
    flex: 1,
    alignItems: "center",
    gap: theme.spacing.sm,
  },

  barWrapper: {
    width: "100%",
    height: 140,
    justifyContent: "flex-end",
    alignItems: "center",
  },

  bar: {
    width: "70%",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 8,
  },

  dayLabel: {
    ...typography.body,
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: "400",
  },

  dayLabelActive: {
    color: theme.colors.text,
    fontWeight: "700",
  },

  // Section
  section: {
    marginBottom: theme.spacing.xl,
  },

  sectionTitle: {
    ...typography.h1,
    fontSize: 22,
    fontWeight: "700",
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    letterSpacing: -0.5,
  },

  // Workouts Scroll
  workoutsScroll: {
    paddingLeft: theme.spacing.lg,
    paddingRight: theme.spacing.lg,
    gap: theme.spacing.md,
  },

  // Workout Card
  workoutCard: {
    width: 240,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    overflow: "hidden",
  },

  imageContainer: {
    width: "100%",
    height: 140,
    position: "relative",
  },

  workoutImage: {
    width: "100%",
    height: "100%",
  },

  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },

  cardContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },

  cardInfo: {
    gap: 4,
  },

  workoutTitle: {
    ...typography.body,
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },

  workoutDuration: {
    ...typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: "400",
  },

  startButton: {
    width: "100%",
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  startButtonText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.background,
    letterSpacing: 0.2,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.md,
  },

  emptyTitle: {
    ...typography.h1,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },

  emptyText: {
    ...typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },

  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: 8,
    gap: theme.spacing.sm,
  },

  createButtonText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.background,
  },
});

export default HomeScreen;
