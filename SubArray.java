import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

class SubArray {
    public static void main(String[] args) {
        int[] arr = {1, 2, 3};
        List<List<Integer>> subarrList = new ArrayList<>();

        for (int i = 0; i < arr.length; i++) {
            for (int j = i + 1; j <= arr.length; j++) {
                // Create a sub-array from i to j
                int[] subArray = Arrays.copyOfRange(arr, i, j);
                // Convert to List<Integer> and add to subarrList
                subarrList.add(Arrays.stream(subArray).boxed().collect(Collectors.toList()));
            }
        }

        // Print the sub-arrays
        System.out.println(subarrList);
    }
}
